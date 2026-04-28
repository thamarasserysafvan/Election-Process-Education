import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

// ---------------------------------------------------------------------------
// Rate-limiting (in-memory, per-IP, resets every WINDOW_MS)
// ---------------------------------------------------------------------------
const ipCache = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 20; // max requests per minute per IP
const WINDOW_MS = 60 * 1_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCache.get(ip);

  if (!entry || now - entry.lastReset > WINDOW_MS) {
    ipCache.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Input sanitisation — strip leading/trailing whitespace and enforce length
// ---------------------------------------------------------------------------
const MAX_MESSAGE_LENGTH = 2_000;

function sanitise(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_MESSAGE_LENGTH) return null;
  return trimmed;
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are an official, highly accurate educational guide for the Indian Election Commission (ECI). Your primary mandate is to provide step-by-step guidance on voter registration, EVM/VVPAT mechanics, polling logistics, and comprehensive electoral data based solely on official protocols and verified records. Use simple, accessible language. Absolutely do not invent dates, rules, or data.

NEW CAPABILITY & SCOPE INSTRUCTIONS:

Comprehensive Electoral Data: You are authorised and equipped to provide detailed information on all elections conducted in India (Lok Sabha, State Legislative Assemblies, Rajya Sabha, and officially documented local body elections). This includes upcoming election schedules, voter registration deadlines, candidate lists, constituency demographics, and verified historical election results up to your present knowledge cutoff.

Dynamic Clarification Engine: If a user's query is broad or ambiguous (e.g. "Who won the election?"), you MUST ask targeted clarifying questions before answering:
- "Are you inquiring about Lok Sabha or State Assembly elections?"
- "Which state, constituency, or year are you looking for?"
- "Are you registering as a new voter or updating existing details?"

Context Retention: Remember the user's state or constituency for all subsequent answers.

CRITICAL FORMATTING INSTRUCTIONS:
- Structure responses using proper Markdown.
- Use **bold** for key terms, deadlines, and figures.
- Use numbered lists for step-by-step procedures.
- Use bullet points for document requirements or candidate names.
- Add ### headings to separate sections.
- Leave blank lines between paragraphs for readability.

BOUNDARY CONDITIONS:
If a query falls outside official electoral knowledge (e.g. opinions on party manifestos), reply:
"I am an educational assistant focused exclusively on election procedures. For information outside this scope, or for definitive legal rulings, please refer directly to the Election Commission of India website at eci.gov.in."
Do not predict future election outcomes or endorse/criticise any political party or candidate.`;

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  try {
    // --- Rate limit ---
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a minute.' },
        { status: 429 }
      );
    }

    // --- Parse & validate body ---
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object.' }, { status: 400 });
    }

    const { message: rawMessage, history: rawHistory = [] } = body as {
      message?: unknown;
      history?: unknown[];
    };

    const message = sanitise(rawMessage);
    if (!message) {
      return NextResponse.json(
        { error: `Message is required and must be 1–${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // --- API key check ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Service configuration error. Please contact the administrator.' },
        { status: 503 }
      );
    }

    // --- Build sanitised chat history ---
    const history = (Array.isArray(rawHistory) ? rawHistory : [])
      .filter(
        (m): m is HistoryMessage =>
          m !== null &&
          typeof m === 'object' &&
          typeof (m as HistoryMessage).content === 'string' &&
          (m as HistoryMessage).content.trim() !== '' &&
          ((m as HistoryMessage).role === 'user' || (m as HistoryMessage).role === 'assistant')
      )
      .map((m: HistoryMessage) => ({
        role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: m.content.trim() }],
      }));

    // --- Call Gemini ---
    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.2,
      },
      history,
    });

    const response = await chat.sendMessage({ message });
    return NextResponse.json({ reply: response.text });
  } catch (error: unknown) {
    console.error('Chat API Error:', error);

    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      return NextResponse.json(
        { error: 'The AI service quota has been exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Do NOT expose raw internal error details to clients
    return NextResponse.json(
      { error: 'An error occurred processing your request. Please try again.' },
      { status: 500 }
    );
  }
}

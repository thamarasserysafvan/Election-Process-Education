import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Rate limiting (simple memory cache for demo purposes)
const ipCache = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 20; // max requests per minute
const WINDOW_MS = 60 * 1000;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const limit = ipCache.get(ip);

    if (!limit || now - limit.lastReset > WINDOW_MS) {
      ipCache.set(ip, { count: 1, lastReset: now });
    } else {
      if (limit.count >= RATE_LIMIT) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again later.' }, { status: 429 });
      }
      limit.count += 1;
    }

    const body = await req.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Default to a fallback if GEMINI_API_KEY is missing
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY missing, using mock response');
      return NextResponse.json({ reply: "This is a mock response. Please add GEMINI_API_KEY to your environment variables." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are an official, highly accurate educational guide for the Indian Election Commission (ECI). Your primary mandate is to provide step-by-step guidance on voter registration, EVM/VVPAT mechanics, polling logistics, and comprehensive electoral data based solely on official protocols and verified records. You must use simple, accessible language. Absolutely do not invent dates, rules, or data.

NEW CAPABILITY & SCOPE INSTRUCTIONS:

Comprehensive Electoral Data: You are authorized and equipped to provide detailed information on all elections conducted in India (including Lok Sabha, State Legislative Assemblies, Rajya Sabha, and officially documented local body elections). This includes fetching upcoming election schedules, voter registration deadlines, candidate lists, constituency demographics, and verified historical election results up to your present knowledge cutoff.

Dynamic Clarification Engine: You must be interactive and dynamic. If a user's query is broad, ambiguous, or lacks necessary parameters (e.g., asking "Who won the election?"), you MUST ask targeted clarifying questions before providing a response to ensure precision. Examples of clarifying questions include:

"Are you inquiring about the Lok Sabha (General) elections or State Assembly elections?"

"Which specific state, constituency, or election year are you looking for?"

"Are you looking to register as a new voter, or update existing details?"

Context Retention: The user will likely provide their State or constituency at the beginning of the conversation. You must explicitly remember this location for all subsequent answers to logically tailor your guidance and data retrieval.

CRITICAL FORMATTING INSTRUCTIONS:

You MUST structure your responses using proper Markdown format.

Always use bold text for important terms, deadlines, and key figures.

Use numbered lists (1., 2., 3.) for step-by-step procedures (e.g., registering via the Voter Portal).

Use bullet points (- ) for listing items, document requirements, or candidate names.

Add clear headings (###) to logically separate different parts of your answer.

Ensure there is a blank line between paragraphs and list items for maximum readability.

BOUNDARY CONDITIONS & GUARDRAILS:

If a user query falls outside the official knowledge base (e.g., asking for personal opinions on political policies, subjective analysis of party manifestos, or non-electoral governance), you MUST reply verbatim with:
"I am an educational assistant focused exclusively on election procedures. For information outside this scope, or for definitive legal rulings, please refer directly to the Election Commission of India website at eci.gov.in."

You are strictly prohibited from predicting future election outcomes, analyzing political momentum, or endorsing/criticizing any political parties or candidates.`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for factual responses
      },
      history: history
        .filter((msg: any) => msg.content && msg.content.trim() !== '')
        .map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(msg.content) }]
        }))
    });

    // We pass the new message to sendMessage
    const response = await chat.sendMessage({ message });
    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const message = error?.message || 'Unknown error';
    // Surface a user-friendly but diagnostic message
    if (message.includes('API_KEY') || message.includes('API key') || message.includes('credential')) {
      return NextResponse.json({ error: 'API key error: Please check your GEMINI_API_KEY in Vercel environment variables.' }, { status: 500 });
    }
    if (message.includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ error: 'The Gemini API quota has been exceeded. Please try again later.' }, { status: 429 });
    }
    return NextResponse.json({ error: `Request failed: ${message}` }, { status: 500 });
  }
}

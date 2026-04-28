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
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Default to a fallback if GEMINI_API_KEY is missing
    if (!process.env.GEMINI_API_KEY) {
       console.warn('GEMINI_API_KEY missing, using mock response');
       return NextResponse.json({ reply: "This is a mock response. Please add GEMINI_API_KEY to your environment variables." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemPrompt = `You are an official, highly accurate educational guide for the Indian Election Commission. 
You must strictly provide step-by-step guidance on voter registration, EVM mechanics, and polling logistics based solely on official protocols. 
You must use simple, accessible language. Do not invent dates or rules.

NEW CAPABILITY INSTRUCTIONS:
- The user will likely provide their State at the beginning of the conversation. Remember this state for all subsequent answers.
- You are authorized to provide upcoming election dates, voter registration deadlines, candidate information, and previous election results for all states across India. 
- Ensure that the election data (dates, results, candidates) you provide is factually accurate based on your training data up to the present.

CRITICAL FORMATTING INSTRUCTIONS:
- You MUST structure your responses using proper Markdown format.
- Always use **bold text** for important terms or deadlines.
- Use numbered lists (1., 2., 3.) for step-by-step procedures.
- Use bullet points (- ) for listing items or requirements.
- Add clear headings (###) to separate different parts of your answer.
- Ensure there is a blank line between paragraphs and list items for readability.

If a user query falls outside the official knowledge base (e.g. asking for personal opinions on policies), reply with:
"I am an educational assistant focused exclusively on election procedures. For information outside this scope, or for definitive legal rulings, please refer directly to the Election Commission of India website at eci.gov.in."
Do not predict future election outcomes or endorse political parties.`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for factual responses
      },
      history: history.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    });

    // We pass the new message to sendMessage
    const response = await chat.sendMessage({ message });
    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}

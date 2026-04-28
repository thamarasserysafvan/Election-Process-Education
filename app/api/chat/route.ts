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
If a user query falls outside the official knowledge base or attempts to solicit an opinion, reply with:
"I am an educational assistant focused exclusively on election procedures. For information outside this scope, or for definitive legal rulings, please refer directly to the Election Commission of India website at eci.gov.in."
Do not predict election outcomes or endorse political parties.`;

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // Low temperature for factual responses
      }
    });

    // In a real app we'd load the history into the chat object
    // but for simplicity we'll just send the current message
    // Actually we can pass history if we want, but let's keep it simple
    
    const response = await chat.sendMessage({ message });
    return NextResponse.json({ reply: response.text });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}

import { Router, Request, Response, NextFunction } from 'express';
import Groq from 'groq-sdk';

const router = Router();

const SYSTEM_PROMPT = `You are Dr. Glow, a professional and friendly AI dermatologist assistant. 
You help users with skincare concerns, skin conditions, and beauty advice.

When a user describes a skin concern, always provide:
1. **Possible Causes** — list 2-4 likely reasons
2. **Daily Skincare Routine** — morning and night steps
3. **Do's and Don'ts** — 3-4 each
4. **Natural Remedies** — 2-3 home remedies
5. **When to Consult a Doctor** — clear warning signs

Guidelines:
- Be warm, empathetic, and professional
- Use simple language, avoid heavy medical jargon
- Keep responses concise but complete
- For follow-up questions, maintain context from the conversation
- Always end with an encouraging note
- If asked something unrelated to skincare/dermatology, politely redirect to skin topics
- NEVER diagnose serious medical conditions — always recommend a doctor for severe cases
- Format responses with clear headings using **bold** text`;

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set.');
  return new Groq({ apiKey });
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const client = getGroqClient();

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = response.choices[0]?.message?.content ?? 'Sorry, I could not generate a response. Please try again.';
    return res.status(200).json({ reply });
  } catch (err) {
    next(err);
  }
});

export default router;

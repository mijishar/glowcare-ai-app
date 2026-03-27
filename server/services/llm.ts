import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are GlowCare AI, a friendly skincare advisor.
Analyze the user's skin concern and respond ONLY with valid JSON matching this schema:
{
  "skinType": "Dry" | "Oily" | "Combination" | "Sensitive" | null,
  "routine": { "morning": string[], "night": string[] },
  "homeRemedies": string[],
  "productSuggestions": string[],
  "dosAndDonts": { "dos": string[], "donts": string[] },
  "dermatologistFlag": boolean
}
Use simple, conversational language. Only suggest safe, widely available products.
Set dermatologistFlag to true if the concern sounds like it needs medical attention.
Respond ONLY with the raw JSON object — no markdown, no code fences, no extra text.`;

export function buildPrompt(input: string): string {
  return input;
}

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Configuration error: GROQ_API_KEY environment variable is not set.');
  }
  return new Groq({ apiKey });
}

export async function getLLMAdvice(input: string): Promise<string> {
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: input },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned an empty response.');
  }

  return content;
}

import Groq from 'groq-sdk';
import sharp from 'sharp';
import { SkinAnalysisResult, SkinType, SeverityLevel } from '../types';

const VISION_PROMPT = `You are an AI dermatologist analyzing a user's face image.

If the image is clear and valid:
- Identify skin type (Oily, Dry, Combination, Normal, or Sensitive)
- Detect:
  • Acne level (none, low, medium, or high)
  • Pigmentation (none, low, medium, or high)
  • Dark circles (none, low, medium, or high)
  • Overall skin health score (0–100, where 100 = perfect skin)

Then provide:
1. Skin Summary — a simple, human-friendly 2-3 sentence explanation
2. Daily Skincare Routine — morning steps and night steps (3-5 each)
3. Do's and Don'ts — 3-4 each
4. Natural Remedies — 3-4 home remedies
5. Product Recommendations — exactly 3 products, each with:
   - name: product name
   - keyIngredients: array of 2-4 key ingredients
   - whySuitable: one sentence explaining why this product suits their skin condition
   - howToUse: one sentence on how/when to apply it

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "skinType": "Oily" | "Dry" | "Combination" | "Normal" | "Sensitive" | null,
  "acne": "none" | "low" | "medium" | "high",
  "pigmentation": "none" | "low" | "medium" | "high",
  "darkCircles": "none" | "low" | "medium" | "high",
  "healthScore": <number 0-100>,
  "skinSummary": "<2-3 sentence friendly summary>",
  "routine": {
    "morning": ["step1", "step2", ...],
    "night": ["step1", "step2", ...]
  },
  "dos": ["do1", "do2", ...],
  "donts": ["dont1", "dont2", ...],
  "naturalRemedies": ["remedy1", "remedy2", ...],
  "productRecommendations": [
    {
      "name": "Product Name",
      "keyIngredients": ["ingredient1", "ingredient2"],
      "whySuitable": "Why this suits their skin condition",
      "howToUse": "Apply morning and night after cleansing"
    }
  ],
  "dermatologistFlag": <boolean>
}

If the image is unclear, not a face, or cannot be analyzed, return:
{
  "skinType": null,
  "acne": "none",
  "pigmentation": "none",
  "darkCircles": "none",
  "healthScore": 0,
  "skinSummary": "⚠️ We couldn't clearly analyze your photo. Please upload a well-lit, front-facing image without filters for the best results.",
  "routine": { "morning": [], "night": [] },
  "dos": [],
  "donts": [],
  "naturalRemedies": [],
  "productRecommendations": [],
  "dermatologistFlag": false
}

NEVER return generic errors. Always return the JSON structure above.`;

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set.');
  return new Groq({ apiKey });
}

const VALID_SKIN_TYPES = new Set(['Dry', 'Oily', 'Combination', 'Sensitive', 'Normal']);
const VALID_SEVERITY = new Set(['none', 'low', 'medium', 'high']);

function stripFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

async function prepareImage(buffer: Buffer): Promise<string> {
  const resized = await sharp(buffer)
    .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();
  console.log(`[vision] Image size after resize: ${(resized.length / 1024).toFixed(1)}KB`);
  return resized.toString('base64');
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function analyzeSkinImage(imageBuffer: Buffer, mimeType: string): Promise<SkinAnalysisResult> {
  const client = getGroqClient();
  const base64Image = await prepareImage(imageBuffer);

  const maxRetries = 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: VISION_PROMPT },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const raw = stripFences(response.choices[0]?.message?.content ?? '');
      console.log('[vision] Raw response:', raw.substring(0, 300));

      let parsed: any;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error('[vision] Failed to parse response:', raw);
        // Return friendly fallback instead of throwing
        return getFallbackResult();
      }

      const skinType: SkinType =
        typeof parsed.skinType === 'string' && VALID_SKIN_TYPES.has(parsed.skinType)
          ? (parsed.skinType as SkinType) : null;

      const toSeverity = (v: unknown): SeverityLevel =>
        typeof v === 'string' && VALID_SEVERITY.has(v) ? (v as SeverityLevel) : 'none';

      const healthScore =
        typeof parsed.healthScore === 'number'
          ? Math.min(100, Math.max(0, Math.round(parsed.healthScore))) : 50;

      const toStringArray = (v: unknown): string[] =>
        Array.isArray(v) ? v.filter((r: unknown) => typeof r === 'string') : [];

      const toProductRecs = (v: unknown) => {
        if (!Array.isArray(v)) return [];
        return v.filter((p: any) => p && typeof p === 'object').map((p: any) => ({
          name: typeof p.name === 'string' ? p.name : '',
          keyIngredients: Array.isArray(p.keyIngredients) ? p.keyIngredients.filter((i: unknown) => typeof i === 'string') : [],
          whySuitable: typeof p.whySuitable === 'string' ? p.whySuitable : '',
          howToUse: typeof p.howToUse === 'string' ? p.howToUse : '',
        })).filter(p => p.name);
      };

      return {
        skinType,
        acne: toSeverity(parsed.acne),
        pigmentation: toSeverity(parsed.pigmentation),
        darkCircles: toSeverity(parsed.darkCircles),
        healthScore,
        skinSummary: typeof parsed.skinSummary === 'string' ? parsed.skinSummary : '',
        routine: {
          morning: toStringArray(parsed.routine?.morning),
          night: toStringArray(parsed.routine?.night),
        },
        dos: toStringArray(parsed.dos),
        donts: toStringArray(parsed.donts),
        naturalRemedies: toStringArray(parsed.naturalRemedies),
        productSuggestions: toStringArray(parsed.productSuggestions),
        productRecommendations: toProductRecs(parsed.productRecommendations),
        recommendations: toStringArray(parsed.productSuggestions),
        dermatologistFlag: parsed.dermatologistFlag === true,
      };
    } catch (err: any) {
      lastError = err;
      const status = err?.status ?? err?.response?.status;
      console.error(`[vision] Attempt ${attempt + 1} failed. Status: ${status}`, err?.message);
      if (status === 429 || (typeof status === 'number' && status >= 500)) {
        const delay = (attempt + 1) * 2000;
        console.log(`[vision] Retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      // For non-retryable errors, return friendly fallback
      return getFallbackResult();
    }
  }

  return getFallbackResult();
}

function getFallbackResult(): SkinAnalysisResult {
  return {
    skinType: null,
    acne: 'none',
    pigmentation: 'none',
    darkCircles: 'none',
    healthScore: 0,
    skinSummary: "⚠️ We couldn't clearly analyze your photo. Please upload a well-lit, front-facing image without filters for the best results.",
    routine: { morning: [], night: [] },
    dos: [],
    donts: [],
    naturalRemedies: [],
    productSuggestions: [],
    productRecommendations: [],
    recommendations: [],
    dermatologistFlag: false,
  };
}

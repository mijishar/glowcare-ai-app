# Building GlowCare AI: A Personalized Skincare Advisor Powered by LLMs

**Author:** [MIJISHA.R]
**Date:** March 27, 2026
**Tags:** `AI` `React` `Node.js` `Skincare` `LLM` `Groq` `TypeScript` `Tailwind CSS`

---

## Introduction

What if you could describe your skin concern in plain English and instantly receive a personalized skincare routine, home remedies, product suggestions, and expert do's and don'ts — all without booking a dermatologist appointment?

That's exactly what **GlowCare AI** does. In this post, I'll walk you through how I built a full-stack AI-powered skincare advisor using React, Node.js, and a large language model (LLM) — from idea to a working, beautifully designed web app.

---

## What is GlowCare AI?

GlowCare AI is a web application that helps users get personalized skincare advice by simply describing their skin concerns in natural language. Whether it's acne, tan removal, dark circles, or achieving glowing skin — the app analyzes the input and returns structured, actionable advice.

### Key Features

- **Natural language input** — describe your concern in your own words
- **Quick-select options** — one-click buttons for common concerns (Acne, Tan Removal, Glowing Skin, Dark Circles)
- **AI-powered advice** — structured response with skincare routine, home remedies, product suggestions, and do's & don'ts
- **Skin type detection** — automatically identifies your skin type (Dry, Oily, Combination, Sensitive)
- **Dermatologist flag** — alerts you when a concern may need professional attention
- **Daily skincare tips** — a fresh tip every day to build better habits
- **Query history** — all past queries saved locally so you can revisit advice anytime

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + custom animations |
| Icons | Lucide React |
| Backend | Node.js + Express + TypeScript |
| AI Engine | Groq API (LLaMA 3.3 70B) |
| Storage | Browser localStorage |
| Testing | Vitest + fast-check (property-based testing) |

---

## Architecture Overview

The app follows a clean client-server architecture:

```
User → React Frontend → Express Backend → Groq LLM API
                ↕
          localStorage
     (history + daily tip state)
```

The frontend never touches the API key — all LLM calls go through the Express backend. This keeps credentials secure and allows centralized prompt engineering.

### Request Flow

1. User types a concern or clicks a quick option
2. Frontend POSTs `{ input: string }` to `/api/query`
3. Backend builds a structured prompt and calls the Groq API
4. Groq returns a strict JSON response
5. Backend parses and validates the response
6. Frontend renders the structured advice and saves it to localStorage

---

## Prompt Engineering

The secret sauce is a carefully crafted system prompt that instructs the LLM to return a strict JSON schema:

```
You are GlowCare AI, a friendly skincare advisor.
Analyze the user's skin concern and respond ONLY with valid JSON matching this schema:
{
  "skinType": "Dry" | "Oily" | "Combination" | "Sensitive" | null,
  "routine": { "morning": string[], "night": string[] },
  "homeRemedies": string[],
  "productSuggestions": string[],
  "dosAndDonts": { "dos": string[], "donts": string[] },
  "dermatologistFlag": boolean
}
```

By enforcing a JSON schema in the prompt, parsing becomes reliable and the frontend always knows exactly what shape of data to expect.

---

## Backend: Parsing and Validation

The parser (`server/services/parser.ts`) validates every field of the LLM response before it reaches the frontend:

- `skinType` must be one of the four valid values or `null`
- `routine.morning` and `routine.night` must be non-empty arrays
- `homeRemedies`, `productSuggestions` must be non-empty arrays
- `dosAndDonts.dos` and `dosAndDonts.donts` must be non-empty arrays
- `dermatologistFlag` must be a boolean

Any malformed response is caught and a user-friendly error is returned — the raw LLM output never leaks to the client.

---

## Frontend: UI Design

The UI was designed with a feminine, calming aesthetic using a pink/peach/beige palette. Key design decisions:

- **Glassmorphism cards** — `bg-white/80 backdrop-blur-sm` for a modern frosted look
- **Gradient hero banners** — warm rose-to-peach gradients for visual hierarchy
- **Smooth animations** — custom `slideUp` and `fadeIn` keyframe animations
- **Color-coded skin types** — blue for Oily, orange for Dry, purple for Combination, pink for Sensitive
- **Side-by-side routine grid** — morning and night routines displayed in a clean two-column layout
- **Do's in green, Don'ts in red** — instant visual distinction with check/x icons

---

## Property-Based Testing

One of the most interesting aspects of this project is the use of **property-based testing (PBT)** with [fast-check](https://github.com/dubzzz/fast-check).

Instead of writing tests for specific examples, PBT generates hundreds of random inputs and verifies that certain properties always hold. For example:

```typescript
// Property: empty/whitespace input is always rejected without an API call
fc.assert(
  fc.property(fc.string().filter(s => s.trim() === ''), (emptyInput) => {
    // assert no API call is made and validation error is shown
  }),
  { numRuns: 100 }
)
```

### Properties Tested

| Property | Description |
|---|---|
| P1 | Empty/whitespace input is rejected without API call |
| P2 | Loading state always shows spinner |
| P3 | Query submission passes exact input to API |
| P4 | Quick option populates input and submits |
| P5 | Only selected quick option is highlighted |
| P6 | Parsed skinType is always a valid enum value or null |
| P7 | Skin type badge renders if and only if skinType is non-null |
| P8 | All four advice sections are present in parsed response |
| P9 | Dermatologist flag always triggers advisory message |
| P10 | Rendered advice always contains all four labeled headings |
| P11 | Daily tips never repeat on consecutive days |
| P12 | Query history save/load round trip is lossless |
| P13 | History list is always ordered newest first |
| P14 | Selecting a history entry always displays its response |
| P15 | Clearing history always results in empty state |
| P16 | Prompt always contains user input and required instructions |
| P17 | LLM API errors always return user-friendly messages |

This approach gave me much higher confidence in correctness than unit tests alone.

---

## Challenges and Lessons Learned

### 1. LLM Rate Limits
The Gemini free tier hit quota limits quickly during development. Switching to **Groq** (free, 14,400 requests/day) solved this immediately — and it's significantly faster too.

### 2. JSON Parsing Reliability
LLMs sometimes wrap JSON in markdown code fences (` ```json `). The parser strips these before parsing, making it robust to common LLM formatting quirks.

### 3. Strict Validation vs. Flexibility
Early versions of the parser were too strict — rejecting valid responses because an array had zero items. Balancing strict validation with real-world LLM output variability required several iterations.

### 4. localStorage as a Database
For a client-side app with no user accounts, localStorage works surprisingly well. The history hook handles serialization, deserialization, and ordering automatically.

---

## What's Next

- **Streaming responses** — show advice word-by-word as the LLM generates it
- **Image input** — let users upload a photo of their skin for visual analysis
- **Product links** — link product suggestions to e-commerce stores
- **Multilingual support** — advice in regional languages
- **PWA support** — installable as a mobile app

---

## Try It Yourself

The full source code is available and the app runs locally with just two commands:

```bash
# Terminal 1 — Frontend
npm install
npm run dev

# Terminal 2 — Backend
cd server
npm install
npm run dev
```

Add your free [Groq API key](https://console.groq.com/keys) to `server/.env` and you're good to go.

---

## Conclusion

GlowCare AI shows how quickly you can build a genuinely useful, production-quality AI application with modern tooling. The combination of React, Express, and a fast LLM API like Groq makes it possible to go from idea to working app in a very short time — while property-based testing ensures the core logic stays correct as the app evolves.

If you're thinking about building your own AI-powered app, the hardest part isn't the AI — it's the prompt engineering, the parsing, and the UX. Get those right and the rest falls into place.

---

*Built with ❤️ using React, Node.js, Groq, and Tailwind CSS.*

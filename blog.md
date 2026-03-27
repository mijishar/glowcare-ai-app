# Building GlowCare AI: A Full-Stack AI-Powered Skincare App

**Author:** [MIJISHA.R]
**Date:** March 27, 2026
**Tags:** `AI` `React` `Node.js` `Skincare` `LLM` `Groq` `TypeScript` `Tailwind CSS` `Gamification` `Computer Vision`

---

## Introduction

What if you could describe your skin concern in plain English, upload a selfie, and instantly receive a personalized skincare routine, home remedies, product suggestions, and expert do's and don'ts — all without booking a dermatologist appointment?

That's exactly what **GlowCare AI** does. In this post, I'll walk you through how I built a full-stack AI-powered skincare advisor using React, Node.js, Groq LLMs, and computer vision — from idea to a feature-rich, beautifully designed web app.

---

## What is GlowCare AI?

GlowCare AI is a web application that helps users get personalized skincare advice through multiple AI-powered features. Whether it's acne, tan removal, dark circles, or achieving glowing skin — the app analyzes your concern and returns structured, actionable advice.

### Key Features

- **Natural language input** — describe your concern in your own words
- **AI Skin Scanner** — upload or take a live photo for full skin analysis
- **Dr. Glow Chat** — ChatGPT-style multi-turn dermatologist AI
- **Skin Progress Tracker** — daily score tracking with improvement graph
- **Gamification** — daily streaks, badges, and glow levels
- **Detailed product recommendations** — with ingredients, why it suits you, and how to use
- **Daily skincare tips** — a fresh tip every day
- **Query history** — all past queries saved locally

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Glassmorphism + Custom animations |
| Icons | Lucide React |
| Charts | Recharts |
| Backend | Node.js + Express + TypeScript |
| AI (Text) | Groq API (LLaMA 3.3 70B) |
| AI (Vision) | Groq API (Llama 4 Scout Vision) |
| Image Processing | Sharp (resize + compress) |
| File Upload | Multer |
| Storage | Browser localStorage |
| Testing | Vitest + fast-check (property-based testing) |

---

## Architecture Overview

```
User → React Frontend → Express Backend → Groq LLM API (text)
                    ↘                  ↘ Groq Vision API (image)
                  localStorage
           (history, scores, streaks, chat)
```

The frontend never touches the API key — all LLM calls go through the Express backend.

---

## Feature Deep Dives

### 1. AI Skin Scanner (Photo Analysis)

Users can upload a photo or use their live webcam to capture a selfie. The image is:

1. Compressed to max 800px using Sharp (stays under Groq's 4MB base64 limit)
2. Sent to Groq's Llama 4 Scout vision model
3. Analyzed for: skin type, acne level, pigmentation, dark circles, health score
4. Returns a full skincare plan with routine, do's/don'ts, natural remedies, and detailed product recommendations

Each product recommendation includes:
- Product name
- Key ingredients (shown as pills)
- Why it suits their skin condition
- How and when to apply it

### 2. Dr. Glow Chat

A ChatGPT-style multi-turn conversation with an AI dermatologist. Features:

- Collapsible sidebar with full conversation history (saved to localStorage)
- Context-aware responses — the AI remembers previous messages
- Quick prompt chips to get started instantly
- Typing indicator with animated dots
- Bold formatting rendered from AI responses
- Up to 20 saved sessions

### 3. Skin Progress Tracker

Every time a user completes a scan, their score is saved with a timestamp. The Progress page shows:

- Large animated score display with color coding (teal = good, amber = fair, red = poor)
- Trend indicator (+/- vs previous scan)
- Area chart showing score history over 30 days (Recharts)
- Step-by-step improvement plan with estimated point gains per step
- Scan history list

### 4. Gamification System

The Achievements page includes:

- **Daily check-in** with streak tracking (+10 XP per day, +5 bonus at 7+ streak)
- **6 Glow Levels**: Glow Starter → Skin Seeker → Glow Apprentice → Radiance Rising → Glow Champion → Skin Goddess 👑
- **11 badges** to earn across streak milestones, scan completions, and score goals
- Level-up and badge unlock toast notifications
- XP system tracking total engagement

---

## Prompt Engineering

The text advice prompt instructs the LLM to return strict JSON:

```
You are GlowCare AI, a friendly skincare advisor.
Analyze the user's skin concern and respond ONLY with valid JSON matching this schema:
{
  "skinType": "Dry" | "Oily" | "Combination" | "Sensitive" | null,
  "routine": { "morning": string[], "night": string[] },
  ...
}
```

The vision prompt instructs the model to act as a dermatologist:

```
You are an AI dermatologist analyzing a user's face image.
Identify skin type, acne level, pigmentation, dark circles, and health score.
Return detailed product recommendations with ingredients, why suitable, and how to use.
```

---

## UI Design

The UI uses a premium teal-to-violet gradient design system:

- **Glassmorphism cards** — `bg-white/75 backdrop-blur-16px`
- **Premium gradient hero** — teal → cyan → violet
- **Animated orbs and particles** in hero sections
- **Dashboard** with skin score + streak stats on the home page
- **Quick-link cards** with gradient icons for all features
- **Color-coded severity bars** for acne, pigmentation, dark circles
- **Animated health score ring** (SVG with stroke-dasharray transition)
- **Staggered list animations** with CSS keyframes

---

## Property-Based Testing

The project uses [fast-check](https://github.com/dubzzz/fast-check) for property-based testing with 17 correctness properties covering input validation, API behavior, history ordering, and more.

---

## Challenges and Lessons Learned

### 1. Vision Model Availability
Gemini 1.5 Flash was unavailable on the free key, and the old Groq vision model (`llama-3.2-11b-vision-preview`) was decommissioned. The solution was `meta-llama/llama-4-scout-17b-16e-instruct` — Groq's current vision model.

### 2. Image Size Limits
Groq's base64 image limit is 4MB. Using Sharp to resize images to max 800px and compress to JPEG 80% quality keeps uploads well within limits.

### 3. Rate Limits
Groq's free tier has per-minute limits. Retry logic with exponential backoff (2s, 4s, 6s) handles transient 429 errors gracefully.

### 4. JSON Parsing Reliability
LLMs sometimes wrap JSON in markdown fences. The parser strips these before parsing and uses `response_format: { type: 'json_object' }` to force clean JSON output.

---

## What's Next

- **Streaming responses** — show advice word-by-word
- **Multilingual support** — advice in regional languages
- **PWA support** — installable as a mobile app
- **Social sharing** — share your skin score and badges
- **Ingredient scanner** — scan product labels for harmful ingredients

---

## Try It Yourself

```bash
# Terminal 1 — Frontend
npm install
npm run dev

# Terminal 2 — Backend
cd server
npm install
npm run dev
```

Add your free [Groq API key](https://console.groq.com/keys) to `server/.env`:
```
GROQ_API_KEY=your_key_here
PORT=3001
```

---

## Conclusion

GlowCare AI shows how quickly you can build a genuinely useful, production-quality AI application with modern tooling. The combination of React, Express, Groq's fast LLM inference, and computer vision makes it possible to go from idea to a feature-rich app in a very short time.

The hardest parts aren't the AI — they're the prompt engineering, image handling, UX design, and making error states feel friendly rather than technical. Get those right and the rest falls into place.

---

*Built with ❤️ using React, Node.js, Groq, Tailwind CSS, and a lot of skincare research.*

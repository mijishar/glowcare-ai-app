import type { AdviceResponse, SkinAnalysisResult } from "../types";

const TIMEOUT_MS = 30_000;

export async function queryAdvice(input: string): Promise<AdviceResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "An unexpected error occurred." }));
      throw new Error(body.error ?? "An unexpected error occurred.");
    }

    return (await response.json()) as AdviceResponse;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error("A network error occurred. Please check your connection and try again.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function analyzeSkin(file: File): Promise<SkinAnalysisResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Analysis failed." }));
      throw new Error(body.error ?? "Analysis failed.");
    }

    return (await response.json()) as SkinAnalysisResult;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    if (err instanceof Error) throw err;
    throw new Error("A network error occurred.");
  } finally {
    clearTimeout(timeoutId);
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: 'Chat failed.' }));
      throw new Error(body.error ?? 'Chat failed.');
    }

    const data = await response.json();
    return data.reply as string;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (err instanceof Error) throw err;
    throw new Error('A network error occurred.');
  } finally {
    clearTimeout(timeoutId);
  }
}

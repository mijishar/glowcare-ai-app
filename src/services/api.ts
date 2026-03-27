import type { AdviceResponse } from "../types";

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

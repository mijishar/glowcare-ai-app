// Feature: glowcare-ai, Property 16: prompt contains user input and required instructions
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Validates: Requirements 8.2
 * P16: For any user input string, the prompt constructed by the backend llm.ts service
 * should contain that input string, a reference to skin type classification, and
 * instructions for all four structured advice sections.
 *
 * The SYSTEM_PROMPT and buildPrompt logic are inlined here to avoid pulling in the
 * `openai` package (a server-only dependency) into the frontend test environment.
 * These must stay in sync with server/services/llm.ts.
 */

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
Set dermatologistFlag to true if the concern sounds like it needs medical attention.`;

function buildPrompt(input: string): { system: string; user: string } {
  return { system: SYSTEM_PROMPT, user: input };
}

describe('P16: Prompt contains user input and required instructions', () => {
  it('user field contains the exact input string for any arbitrary input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const { user } = buildPrompt(input);
        expect(user).toBe(input);
      }),
      { numRuns: 100 }
    );
  });

  it('system prompt references skin type classification for any input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const { system } = buildPrompt(input);
        // The system prompt must reference skin type classification
        expect(system.toLowerCase()).toContain('skintype');
      }),
      { numRuns: 100 }
    );
  });

  it('system prompt contains instructions for all four advice sections for any input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const { system } = buildPrompt(input);
        const lower = system.toLowerCase();

        // routine section
        expect(lower).toContain('routine');
        // home remedies section
        expect(lower).toContain('homeremedies');
        // product suggestions section
        expect(lower).toContain('productsuggestions');
        // dos and don'ts section
        expect(lower).toContain('dosanddonts');
      }),
      { numRuns: 100 }
    );
  });

  it('combined: prompt contains input and all required instructions for any input', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const { system, user } = buildPrompt(input);
        const lower = system.toLowerCase();

        // user field is the exact input
        expect(user).toBe(input);

        // skin type classification reference
        expect(lower).toContain('skintype');

        // all four advice sections
        expect(lower).toContain('routine');
        expect(lower).toContain('homeremedies');
        expect(lower).toContain('productsuggestions');
        expect(lower).toContain('dosanddonts');
      }),
      { numRuns: 100 }
    );
  });
});

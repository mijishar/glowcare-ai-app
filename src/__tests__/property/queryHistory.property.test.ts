// Feature: glowcare-ai, Property 12: query history save/load round trip
import { describe, it, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { saveHistoryEntry } from '../../hooks/useQueryHistory';
import type { AdviceResponse, QueryHistoryEntry, SkinType } from '../../types';

/**
 * Validates: Requirements 7.1
 * P12: For any query input string and its corresponding AdviceResponse, after saving
 * the entry via useQueryHistory, reading from localStorage should return an entry
 * containing that exact input and response.
 */

const STORAGE_KEY = 'glowcare_history';

const skinTypeArb = fc.option(
  fc.constantFrom<SkinType>('Dry', 'Oily', 'Combination', 'Sensitive'),
  { nil: null }
);

const nonEmptyStringArray = fc.array(fc.string({ minLength: 1 }), { minLength: 1 });

const adviceResponseArb: fc.Arbitrary<AdviceResponse> = fc.record({
  skinType: skinTypeArb,
  routine: fc.record({
    morning: nonEmptyStringArray,
    night: nonEmptyStringArray,
  }),
  homeRemedies: nonEmptyStringArray,
  productSuggestions: nonEmptyStringArray,
  dosAndDonts: fc.record({
    dos: nonEmptyStringArray,
    donts: nonEmptyStringArray,
  }),
  dermatologistFlag: fc.boolean(),
});

function persistHistory(entries: QueryHistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadHistory(): QueryHistoryEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as QueryHistoryEntry[];
}

describe('P12: Query history save/load round trip', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saved entry is retrievable from localStorage with exact input and response', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        adviceResponseArb,
        (input, response) => {
          localStorage.clear();

          // Save via the pure helper (mirrors what the hook does)
          const updated = saveHistoryEntry([], input, response);
          persistHistory(updated);

          // Read back from localStorage
          const loaded = loadHistory();

          // There should be exactly one entry
          if (loaded.length !== 1) return false;

          const entry = loaded[0];

          // Input must round-trip exactly
          if (entry.input !== input) return false;

          // Response must round-trip exactly (deep equality via JSON)
          if (JSON.stringify(entry.response) !== JSON.stringify(response)) return false;

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('multiple saved entries all round-trip with exact input and response', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(fc.string({ minLength: 1 }), adviceResponseArb),
          { minLength: 1, maxLength: 5 }
        ),
        (pairs) => {
          localStorage.clear();

          // Sequentially add entries (newest first, as the hook does)
          let current: QueryHistoryEntry[] = [];
          for (const [input, response] of pairs) {
            current = saveHistoryEntry(current, input, response);
          }
          persistHistory(current);

          const loaded = loadHistory();

          if (loaded.length !== pairs.length) return false;

          // Each loaded entry must match the corresponding saved entry
          for (let i = 0; i < loaded.length; i++) {
            if (loaded[i].input !== current[i].input) return false;
            if (JSON.stringify(loaded[i].response) !== JSON.stringify(current[i].response)) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

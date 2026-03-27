// Feature: glowcare-ai, Property 11: daily tips do not repeat on consecutive days
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { getDailyTipIndex } from '../../hooks/useDailyTip';
import { SKINCARE_TIPS } from '../../data/tips';

/**
 * Validates: Requirements 6.2
 *
 * P11: For any pair of consecutive calendar dates, the tip returned by useDailyTip
 * for day N should differ from the tip returned for day N+1.
 *
 * Strategy: We test the pure helper `getDailyTipIndex` directly, which encapsulates
 * the rotation logic. We generate a date string for day N, simulate what index would
 * be stored after day N runs, then call getDailyTipIndex for day N+1 and assert the
 * resulting tip text differs.
 */

const tipsCount = SKINCARE_TIPS.length;

/**
 * Generates a valid ISO date string "YYYY-MM-DD" for a year in [2020, 2030].
 */
const dateStringArb = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .map((d) => d.toISOString().slice(0, 10));

/**
 * Returns the next calendar date string given a "YYYY-MM-DD" string.
 */
function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00Z'); // noon UTC to avoid DST edge cases
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

describe('P11: Daily tips do not repeat on consecutive days', () => {
  it('tip for day N+1 differs from tip for day N', () => {
    fc.assert(
      fc.property(dateStringArb, (dayN) => {
        const dayNPlus1 = nextDay(dayN);

        // Simulate: on day N there is no prior state (first run or new day).
        // getDailyTipIndex picks index for day N.
        const indexN = getDailyTipIndex(dayN, null, null, tipsCount);

        // Simulate: on day N+1, the stored date is dayN and stored index is indexN.
        const indexNPlus1 = getDailyTipIndex(dayNPlus1, dayN, indexN, tipsCount);

        // The tip texts must differ.
        return SKINCARE_TIPS[indexN] !== SKINCARE_TIPS[indexNPlus1];
      }),
      { numRuns: 100 }
    );
  });

  it('tip for day N+1 differs regardless of which valid index was stored for day N', () => {
    fc.assert(
      fc.property(
        dateStringArb,
        fc.integer({ min: 0, max: tipsCount - 1 }),
        (dayN, storedIndexN) => {
          const dayNPlus1 = nextDay(dayN);

          // On day N+1, the stored state reflects whatever tip was shown on day N.
          const indexNPlus1 = getDailyTipIndex(dayNPlus1, dayN, storedIndexN, tipsCount);

          return SKINCARE_TIPS[storedIndexN] !== SKINCARE_TIPS[indexNPlus1];
        }
      ),
      { numRuns: 100 }
    );
  });
});

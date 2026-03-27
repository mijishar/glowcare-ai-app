// Feature: glowcare-ai, Property 14: selecting history entry displays its response
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import type { QueryHistoryEntry, AdviceResponse, SkinType } from "../../types";
import HistoryList from "../../components/HistoryList";
import AdviceCard from "../../components/AdviceCard";
import { useState } from "react";

/**
 * Validates: Requirements 7.3
 *
 * P14: For any QueryHistoryEntry in the history list, selecting it should cause
 * the full AdviceResponse associated with that entry's id to be displayed.
 *
 * This test verifies the full display pipeline: clicking a history item causes
 * the AdviceCard to render with the correct AdviceResponse data from that entry.
 */

const SKIN_TYPES: SkinType[] = ["Dry", "Oily", "Combination", "Sensitive", null];

/** Arbitrary for a non-empty string array */
const nonEmptyStringArrayArb = fc.array(
  fc.string({ minLength: 1, maxLength: 40 }),
  { minLength: 1, maxLength: 4 }
);

/** Arbitrary for a full AdviceResponse */
const adviceResponseArb: fc.Arbitrary<AdviceResponse> = fc.record({
  skinType: fc.constantFrom(...SKIN_TYPES),
  routine: fc.record({
    morning: nonEmptyStringArrayArb,
    night: nonEmptyStringArrayArb,
  }),
  homeRemedies: nonEmptyStringArrayArb,
  productSuggestions: nonEmptyStringArrayArb,
  dosAndDonts: fc.record({
    dos: nonEmptyStringArrayArb,
    donts: nonEmptyStringArrayArb,
  }),
  dermatologistFlag: fc.boolean(),
});

/** Arbitrary for a QueryHistoryEntry with a unique id */
const historyEntryArb: fc.Arbitrary<QueryHistoryEntry> = fc.record({
  id: fc.uuid(),
  timestamp: fc.integer({ min: 1_000_000, max: 2_000_000_000 }),
  input: fc.string({ minLength: 1, maxLength: 80 }),
  response: adviceResponseArb,
});

/**
 * A minimal harness component that wires HistoryList + AdviceCard together
 * the same way History.tsx does, but accepts history as a prop so we can
 * control it from the test without touching localStorage.
 */
function HistoryHarness({ history }: { history: QueryHistoryEntry[] }) {
  const [selected, setSelected] = useState<QueryHistoryEntry | null>(null);

  return (
    <div>
      {selected === null ? (
        <HistoryList history={history} onSelect={setSelected} onClear={vi.fn()} />
      ) : (
        <div>
          <button
            data-testid="back-btn"
            onClick={() => setSelected(null)}
          >
            Back
          </button>
          <AdviceCard advice={selected.response} />
        </div>
      )}
    </div>
  );
}

describe("P14: Selecting a history entry displays its response", () => {
  beforeEach(() => {
    // Ensure a clean DOM between runs
  });

  it("displays the AdviceCard with the correct response when a history item is selected", () => {
    fc.assert(
      fc.property(
        fc.array(historyEntryArb, { minLength: 1, maxLength: 6 }),
        fc.integer({ min: 0, max: 5 }),
        (entries, rawIndex) => {
          const clickIndex = rawIndex % entries.length;
          const targetEntry = entries[clickIndex];

          const { unmount } = render(<HistoryHarness history={entries} />);

          // Before selection: history list should be visible, AdviceCard should not
          const items = screen.getAllByTestId("history-item");

          // Click the target entry
          fireEvent.click(items[clickIndex]);

          // After selection: AdviceCard sections should be visible
          const routineSection = screen.queryByTestId("section-routine");
          const homeRemediesSection = screen.queryByTestId("section-home-remedies");
          const productSection = screen.queryByTestId("section-product-suggestions");
          const dosSection = screen.queryByTestId("section-dos-and-donts");

          const allSectionsPresent =
            routineSection !== null &&
            homeRemediesSection !== null &&
            productSection !== null &&
            dosSection !== null;

          if (!allSectionsPresent) {
            unmount();
            return false;
          }

          // Verify the displayed content matches the selected entry's response
          // Check at least one item from each section appears in the rendered output
          const pageText = document.body.textContent ?? "";

          const morningStep = targetEntry.response.routine.morning[0];
          const nightStep = targetEntry.response.routine.night[0];
          const remedy = targetEntry.response.homeRemedies[0];
          const product = targetEntry.response.productSuggestions[0];
          const doItem = targetEntry.response.dosAndDonts.dos[0];
          const dontItem = targetEntry.response.dosAndDonts.donts[0];

          const contentMatches =
            pageText.includes(morningStep) &&
            pageText.includes(nightStep) &&
            pageText.includes(remedy) &&
            pageText.includes(product) &&
            pageText.includes(doItem) &&
            pageText.includes(dontItem);

          unmount();
          return contentMatches;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("displays the skin type badge when the selected entry has a non-null skin type", () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          timestamp: fc.integer({ min: 1, max: 2_000_000_000 }),
          input: fc.string({ minLength: 1, maxLength: 80 }),
          response: fc.record({
            skinType: fc.constantFrom("Dry", "Oily", "Combination", "Sensitive") as fc.Arbitrary<SkinType>,
            routine: fc.record({
              morning: nonEmptyStringArrayArb,
              night: nonEmptyStringArrayArb,
            }),
            homeRemedies: nonEmptyStringArrayArb,
            productSuggestions: nonEmptyStringArrayArb,
            dosAndDonts: fc.record({
              dos: nonEmptyStringArrayArb,
              donts: nonEmptyStringArrayArb,
            }),
            dermatologistFlag: fc.boolean(),
          }),
        }),
        (entry) => {
          const { unmount } = render(<HistoryHarness history={[entry]} />);

          const items = screen.getAllByTestId("history-item");
          fireEvent.click(items[0]);

          // The skin type badge should be present since skinType is non-null
          const skinTypeBadge = screen.queryByTestId("skin-type-tag");
          const result = skinTypeBadge !== null;

          unmount();
          return result;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("selecting a different entry each time shows that entry's unique response content", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.uuid(), { minLength: 2, maxLength: 5 }).chain((ids) =>
          fc.tuple(
            ...ids.map((id, i) =>
              fc.record({
                id: fc.constant(id),
                timestamp: fc.constant(i + 1),
                input: fc.constant(`Query for entry ${id}`),
                response: fc.record({
                  skinType: fc.constant(null as SkinType),
                  routine: fc.record({
                    morning: fc.constant([`morning-step-${id}`]),
                    night: fc.constant([`night-step-${id}`]),
                  }),
                  homeRemedies: fc.constant([`remedy-${id}`]),
                  productSuggestions: fc.constant([`product-${id}`]),
                  dosAndDonts: fc.record({
                    dos: fc.constant([`do-${id}`]),
                    donts: fc.constant([`dont-${id}`]),
                  }),
                  dermatologistFlag: fc.constant(false),
                }),
              })
            )
          ).map((tuple) => tuple as QueryHistoryEntry[])
        ),
        fc.integer({ min: 0, max: 4 }),
        (entries, rawIndex) => {
          const clickIndex = rawIndex % entries.length;
          const target = entries[clickIndex];

          const { unmount } = render(<HistoryHarness history={entries} />);

          const items = screen.getAllByTestId("history-item");
          fireEvent.click(items[clickIndex]);

          const pageText = document.body.textContent ?? "";

          // The selected entry's unique content should be visible
          const selectedVisible =
            pageText.includes(`remedy-${target.id}`) &&
            pageText.includes(`product-${target.id}`);

          // Other entries' unique content should NOT be visible
          const otherVisible = entries
            .filter((_, i) => i !== clickIndex)
            .some(
              (e) =>
                pageText.includes(`remedy-${e.id}`) ||
                pageText.includes(`product-${e.id}`)
            );

          unmount();
          return selectedVisible && !otherVisible;
        }
      ),
      { numRuns: 100 }
    );
  });
});

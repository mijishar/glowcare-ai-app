// Feature: glowcare-ai, Property P13: History is ordered newest first
// Feature: glowcare-ai, Property P14: Selecting a history entry displays its response
// Feature: glowcare-ai, Property P15: Clear history results in empty state
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import HistoryList from "../../components/HistoryList";
import type { QueryHistoryEntry, AdviceResponse } from "../../types";

const SKIN_TYPES = ["Dry", "Oily", "Combination", "Sensitive", null] as const;

const adviceResponseArb = (): fc.Arbitrary<AdviceResponse> =>
  fc.record({
    skinType: fc.constantFrom(...SKIN_TYPES),
    routine: fc.record({
      morning: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
      night: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
    }),
    homeRemedies: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
    productSuggestions: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
    dosAndDonts: fc.record({
      dos: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
      donts: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
    }),
    dermatologistFlag: fc.boolean(),
  });


/**
 * Validates: Requirements 7.2
 * P13: For any set of QueryHistoryEntry items with distinct timestamps,
 * the list rendered by HistoryList should display entries in descending
 * timestamp order (most recent first).
 */
describe("P13: History is ordered newest first", () => {
  it("renders entries in the exact order provided (descending timestamps)", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 1_000_000 }), {
          minLength: 2,
          maxLength: 8,
        }).map((timestamps) => timestamps.sort((a, b) => b - a)),
        (timestamps) => {
          // Build entries with those timestamps in descending order
          const entries: QueryHistoryEntry[] = timestamps.map((ts, i) => ({
            id: String(i),
            timestamp: ts,
            input: `Query ${i}`,
            response: {
              skinType: null,
              routine: { morning: ["step"], night: ["step"] },
              homeRemedies: ["remedy"],
              productSuggestions: ["product"],
              dosAndDonts: { dos: ["do"], donts: ["dont"] },
              dermatologistFlag: false,
            },
          }));

          const { unmount } = render(
            <HistoryList history={entries} onSelect={vi.fn()} onClear={vi.fn()} />
          );
          const items = screen.getAllByTestId("history-item");
          expect(items).toHaveLength(entries.length);
          entries.forEach((entry, idx) => {
            expect(items[idx]).toHaveTextContent(entry.input);
          });
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements 7.3
 * P14: For any QueryHistoryEntry in the history list, selecting it should cause
 * the full AdviceResponse associated with that entry's id to be displayed.
 */
describe("P14: Selecting a history entry displays its response", () => {
  it("calls onSelect with the exact entry that was clicked", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 1_000_000 }), {
          minLength: 1,
          maxLength: 6,
        }),
        fc.integer({ min: 0, max: 5 }),
        (timestamps, rawIndex) => {
          const entries: QueryHistoryEntry[] = timestamps.map((ts, i) => ({
            id: `id-${i}`,
            timestamp: ts,
            input: `Query ${i}`,
            response: {
              skinType: null,
              routine: { morning: ["step"], night: ["step"] },
              homeRemedies: ["remedy"],
              productSuggestions: ["product"],
              dosAndDonts: { dos: ["do"], donts: ["dont"] },
              dermatologistFlag: false,
            },
          }));

          const clickIndex = rawIndex % entries.length;
          const onSelect = vi.fn();

          const { unmount } = render(
            <HistoryList history={entries} onSelect={onSelect} onClear={vi.fn()} />
          );
          const items = screen.getAllByTestId("history-item");
          fireEvent.click(items[clickIndex]);

          expect(onSelect).toHaveBeenCalledTimes(1);
          expect(onSelect).toHaveBeenCalledWith(entries[clickIndex]);
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements 7.4
 * P15: For any non-empty history state, calling the clear history action should
 * result in the history view rendering the empty state.
 */
describe("P15: Clear history results in empty state", () => {
  it("shows empty state after clear button is clicked", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            timestamp: fc.integer({ min: 1, max: 1_000_000 }),
            input: fc.string({ minLength: 1, maxLength: 50 }),
            response: adviceResponseArb(),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (entries) => {
          let history = entries;
          const onClear = vi.fn(() => {
            history = [];
          });

          const { rerender, unmount } = render(
            <HistoryList history={history} onSelect={vi.fn()} onClear={onClear} />
          );

          // Initially non-empty — clear button should be present
          expect(screen.getByTestId("clear-history-btn")).toBeInTheDocument();
          expect(screen.queryByTestId("history-empty-state")).not.toBeInTheDocument();

          fireEvent.click(screen.getByTestId("clear-history-btn"));
          expect(onClear).toHaveBeenCalledTimes(1);

          // Re-render with empty history (simulating state update)
          rerender(
            <HistoryList history={[]} onSelect={vi.fn()} onClear={onClear} />
          );

          expect(screen.getByTestId("history-empty-state")).toBeInTheDocument();
          expect(screen.queryByTestId("clear-history-btn")).not.toBeInTheDocument();
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});

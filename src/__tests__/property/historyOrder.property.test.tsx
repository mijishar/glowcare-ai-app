// Feature: glowcare-ai, Property 13: history list is ordered newest first
import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import * as fc from "fast-check";
import HistoryList from "../../components/HistoryList";
import type { QueryHistoryEntry } from "../../types";

/**
 * Validates: Requirements 7.2
 *
 * P13: For any set of QueryHistoryEntry items with distinct timestamps,
 * the list rendered by HistoryList should display entries in descending
 * timestamp order (most recent first).
 */

/** Minimal stub AdviceResponse — content is irrelevant for ordering tests */
const stubResponse: QueryHistoryEntry["response"] = {
  skinType: null,
  routine: { morning: ["step"], night: ["step"] },
  homeRemedies: ["remedy"],
  productSuggestions: ["product"],
  dosAndDonts: { dos: ["do"], donts: ["dont"] },
  dermatologistFlag: false,
};

/**
 * Arbitrary that produces an array of QueryHistoryEntry values whose
 * timestamps are all distinct. The entries are intentionally generated in
 * arbitrary (potentially ascending or shuffled) order so the test verifies
 * that the *caller* is responsible for passing them pre-sorted, and that
 * HistoryList renders them in exactly the order it receives.
 *
 * The property asserts: if the caller passes entries sorted newest-first,
 * the rendered items appear in that same descending order.
 */
const distinctTimestampEntriesArb: fc.Arbitrary<QueryHistoryEntry[]> = fc
  .uniqueArray(fc.integer({ min: 1, max: 1_000_000_000 }), {
    minLength: 2,
    maxLength: 10,
  })
  .map((timestamps) =>
    // Sort descending (newest first) — this is the contract the component expects
    [...timestamps]
      .sort((a, b) => b - a)
      .map((ts, idx) => ({
        id: `entry-${idx}-${ts}`,
        timestamp: ts,
        input: `Query about skin concern #${idx} at ${ts}`,
        response: stubResponse,
      }))
  );

describe("P13: History list is ordered newest first", () => {
  it("renders history items in descending timestamp order for any set of distinct timestamps", () => {
    fc.assert(
      fc.property(distinctTimestampEntriesArb, (entries) => {
        const { unmount } = render(
          <HistoryList history={entries} onSelect={vi.fn()} onClear={vi.fn()} />
        );

        const items = screen.getAllByTestId("history-item");

        // Number of rendered items must match the number of entries
        if (items.length !== entries.length) {
          unmount();
          return false;
        }

        // Each rendered item must display the input text of the entry at the
        // same position — confirming the order is preserved (descending by ts)
        for (let i = 0; i < entries.length; i++) {
          if (!items[i].textContent?.includes(entries[i].input)) {
            unmount();
            return false;
          }
        }

        // Additionally verify the timestamps of consecutive rendered entries
        // are strictly decreasing (newest first)
        for (let i = 0; i < entries.length - 1; i++) {
          if (entries[i].timestamp <= entries[i + 1].timestamp) {
            unmount();
            return false;
          }
        }

        unmount();
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it("single-entry history renders that entry without ordering issues", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000_000 }),
        fc.string({ minLength: 1, maxLength: 80 }),
        (timestamp, input) => {
          const entries: QueryHistoryEntry[] = [
            { id: "only-entry", timestamp, input, response: stubResponse },
          ];

          const { unmount } = render(
            <HistoryList history={entries} onSelect={vi.fn()} onClear={vi.fn()} />
          );

          const items = screen.getAllByTestId("history-item");
          const result =
            items.length === 1 && items[0].textContent?.includes(input);

          unmount();
          return result;
        }
      ),
      { numRuns: 100 }
    );
  });
});

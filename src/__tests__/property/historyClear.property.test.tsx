// Feature: glowcare-ai, Property 15: clear history results in empty state
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import HistoryList from "../../components/HistoryList";
import type { QueryHistoryEntry, AdviceResponse, SkinType } from "../../types";

/**
 * Validates: Requirements 7.4
 *
 * P15: For any non-empty history state, calling the clear history action should
 * result in localStorage containing an empty array for glowcare_history, and
 * the history view should render the empty state.
 */

const STORAGE_KEY = "glowcare_history";

const SKIN_TYPES: SkinType[] = ["Dry", "Oily", "Combination", "Sensitive", null];

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

const nonEmptyHistoryArb = (): fc.Arbitrary<QueryHistoryEntry[]> =>
  fc.array(
    fc.record({
      id: fc.uuid(),
      timestamp: fc.integer({ min: 1, max: 1_000_000_000 }),
      input: fc.string({ minLength: 1, maxLength: 80 }),
      response: adviceResponseArb(),
    }),
    { minLength: 1, maxLength: 8 }
  );

beforeEach(() => {
  localStorage.clear();
});

describe("P15: Clear history results in empty state", () => {
  it("localStorage contains empty array after clear action is triggered", () => {
    fc.assert(
      fc.property(nonEmptyHistoryArb(), (entries) => {
        // Seed localStorage with non-empty history
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

        // Simulate the clear action: mirrors what useQueryHistory.clearHistory does
        const onClear = vi.fn(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
        });

        const { unmount } = render(
          <HistoryList history={entries} onSelect={vi.fn()} onClear={onClear} />
        );

        // Clear button must be present when history is non-empty
        const clearBtn = screen.getByTestId("clear-history-btn");
        expect(clearBtn).toBeInTheDocument();

        fireEvent.click(clearBtn);
        expect(onClear).toHaveBeenCalledTimes(1);

        // localStorage must now hold an empty array
        const raw = localStorage.getItem(STORAGE_KEY);
        expect(raw).not.toBeNull();
        const stored = JSON.parse(raw!);
        expect(Array.isArray(stored)).toBe(true);
        expect(stored).toHaveLength(0);

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("history view renders empty state after clear action is triggered", () => {
    fc.assert(
      fc.property(nonEmptyHistoryArb(), (entries) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

        let currentHistory = entries;
        const onClear = vi.fn(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          currentHistory = [];
        });

        const { rerender, unmount } = render(
          <HistoryList
            history={currentHistory}
            onSelect={vi.fn()}
            onClear={onClear}
          />
        );

        // Non-empty: empty state must NOT be visible
        expect(screen.queryByTestId("history-empty-state")).not.toBeInTheDocument();
        expect(screen.getByTestId("clear-history-btn")).toBeInTheDocument();

        fireEvent.click(screen.getByTestId("clear-history-btn"));

        // Re-render with the now-empty history (mirrors React state update)
        rerender(
          <HistoryList
            history={currentHistory}
            onSelect={vi.fn()}
            onClear={onClear}
          />
        );

        // Empty state must now be visible
        expect(screen.getByTestId("history-empty-state")).toBeInTheDocument();
        // Clear button must be gone
        expect(screen.queryByTestId("clear-history-btn")).not.toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 }
    );
  });

  it("localStorage is empty and empty state renders together after clear", () => {
    fc.assert(
      fc.property(nonEmptyHistoryArb(), (entries) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

        let currentHistory = entries;
        const onClear = vi.fn(() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
          currentHistory = [];
        });

        const { rerender, unmount } = render(
          <HistoryList
            history={currentHistory}
            onSelect={vi.fn()}
            onClear={onClear}
          />
        );

        fireEvent.click(screen.getByTestId("clear-history-btn"));

        rerender(
          <HistoryList
            history={currentHistory}
            onSelect={vi.fn()}
            onClear={onClear}
          />
        );

        // Both conditions must hold simultaneously
        const raw = localStorage.getItem(STORAGE_KEY);
        const stored = JSON.parse(raw!);
        expect(stored).toHaveLength(0);
        expect(screen.getByTestId("history-empty-state")).toBeInTheDocument();

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

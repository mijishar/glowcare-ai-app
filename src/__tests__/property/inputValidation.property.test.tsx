// Feature: glowcare-ai, Property P1: empty/whitespace input rejected (no API call)
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import * as fc from "fast-check";
import QueryInput from "../../components/QueryInput";

/**
 * Validates: Requirements 1.3
 * P1: For any input string composed entirely of whitespace characters (or the
 * empty string), submitting it should trigger a validation error, the API
 * service should not be called, and the query list should remain unchanged.
 */
describe("P1: empty/whitespace input rejected (no API call)", () => {
  it("shows validation error and does not call onSubmit for whitespace-only inputs", () => {
    // Arbitrary: empty string OR strings made only of spaces, tabs, newlines
    const whitespaceArb = fc.oneof(
      fc.constant(""),
      fc.stringOf(fc.constantFrom(" ", "\t", "\n", "\r"), { minLength: 1, maxLength: 50 })
    );

    fc.assert(
      fc.property(whitespaceArb, (input) => {
        const onSubmit = vi.fn();
        const onChange = vi.fn();

        const { unmount } = render(
          <QueryInput
            value={input}
            onChange={onChange}
            onSubmit={onSubmit}
            isLoading={false}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /submit skin concern/i }));

        // Validation error must be shown
        expect(screen.getByRole("alert")).toBeInTheDocument();

        // API (onSubmit) must NOT have been called
        expect(onSubmit).not.toHaveBeenCalled();

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: glowcare-ai, Property P3: Query submission passes input to API

/**
 * Validates: Requirements 1.2
 * P3: For any non-empty input string, submitting the query should result in
 * the API service being called with exactly that input string.
 */
describe("P3: query submission passes input to API", () => {
  it("calls onSubmit with exactly the input string for any non-empty, non-whitespace input", () => {
    // Arbitrary: non-empty strings that contain at least one non-whitespace character
    const nonEmptyArb = fc.stringOf(fc.char(), { minLength: 1, maxLength: 100 }).filter(
      (s) => s.trim().length > 0
    );

    fc.assert(
      fc.property(nonEmptyArb, (input) => {
        const onSubmit = vi.fn();
        const onChange = vi.fn();

        const { unmount } = render(
          <QueryInput
            value={input}
            onChange={onChange}
            onSubmit={onSubmit}
            isLoading={false}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /submit skin concern/i }));

        // API (onSubmit) must have been called with exactly the input string
        expect(onSubmit).toHaveBeenCalledOnce();
        expect(onSubmit).toHaveBeenCalledWith(input);

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: glowcare-ai, Property P4: Quick option populates input and submits
// Feature: glowcare-ai, Property P5: Quick option selection is visually highlighted
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import QuickOptions, { QUICK_OPTIONS } from '../../components/QuickOptions';

/**
 * Validates: Requirements 2.2
 * P4: For any Quick Option button, clicking it should set the text input value
 * to the option's label text and trigger a query submission with that text.
 */
describe('P4: Quick option populates input and submits', () => {
  it('clicking any quick option calls onSelect with the option label', () => {
    // Arbitrary: pick any index from the QUICK_OPTIONS array
    fc.assert(
      fc.property(fc.integer({ min: 0, max: QUICK_OPTIONS.length - 1 }), (index) => {
        const option = QUICK_OPTIONS[index];
        const onSelect = vi.fn();
        const { unmount } = render(
          <QuickOptions selectedOption={null} onSelect={onSelect} />
        );
        fireEvent.click(screen.getByRole('button', { name: option }));
        expect(onSelect).toHaveBeenCalledTimes(1);
        expect(onSelect).toHaveBeenCalledWith(option);
        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Validates: Requirements 2.3
 * P5: For any Quick Option, after it is selected, that button should have the
 * active/highlighted CSS class applied, and no other quick option button should
 * have that class.
 */
describe('P5: Quick option selection is visually highlighted', () => {
  it('only the selected button has aria-pressed=true and active styling', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: QUICK_OPTIONS.length - 1 }), (index) => {
        const selectedOption = QUICK_OPTIONS[index];
        const { unmount } = render(
          <QuickOptions selectedOption={selectedOption} onSelect={vi.fn()} />
        );
        const buttons = screen.getAllByRole('button');

        // Exactly one button should be active
        const activeButtons = buttons.filter(
          (btn) => btn.getAttribute('aria-pressed') === 'true'
        );
        expect(activeButtons).toHaveLength(1);
        expect(activeButtons[0]).toHaveTextContent(selectedOption);

        // Active button has the filled rose background class
        expect(activeButtons[0].className).toContain('bg-rose-400');

        // All other buttons must NOT have the active class
        const inactiveButtons = buttons.filter(
          (btn) => btn.getAttribute('aria-pressed') === 'false'
        );
        inactiveButtons.forEach((btn) => {
          expect(btn.className).not.toContain('bg-rose-400');
        });

        unmount();
      }),
      { numRuns: 100 }
    );
  });
});

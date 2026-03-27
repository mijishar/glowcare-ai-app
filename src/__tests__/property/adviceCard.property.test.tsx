// Feature: glowcare-ai, Property 10: rendered advice contains all four labeled section headings
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import AdviceCard from '../../components/AdviceCard';
import type { AdviceResponse, SkinType } from '../../types';

/**
 * Validates: Requirements 4.5
 * P10: For any AdviceResponse, the rendered AdviceCard should contain visible section
 * headings for all four sections: Skincare Routine, Home Remedies, Product Suggestions,
 * and Do's and Don'ts.
 */

const skinTypeArb = fc.option(
  fc.constantFrom<SkinType>('Dry', 'Oily', 'Combination', 'Sensitive'),
  { nil: null }
);

const nonEmptyStringArray = fc.array(fc.string({ minLength: 1 }), { minLength: 1 });

const adviceResponseArb = fc.record<AdviceResponse>({
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

describe('P10: Rendered advice contains all four labeled section headings', () => {
  it('all four section headings are present for any AdviceResponse', () => {
    fc.assert(
      fc.property(adviceResponseArb, (advice) => {
        const { unmount } = render(<AdviceCard advice={advice} />);
        try {
          const routine = screen.getByTestId('section-routine');
          const homeRemedies = screen.getByTestId('section-home-remedies');
          const productSuggestions = screen.getByTestId('section-product-suggestions');
          const dosAndDonts = screen.getByTestId('section-dos-and-donts');

          return (
            routine.textContent === 'Skincare Routine' &&
            homeRemedies.textContent === 'Home Remedies' &&
            productSuggestions.textContent === 'Product Suggestions' &&
            dosAndDonts.textContent === "Do's and Don'ts"
          );
        } finally {
          unmount();
        }
      }),
      { numRuns: 100 }
    );
  });
});

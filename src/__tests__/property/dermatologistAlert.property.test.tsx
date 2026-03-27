// Feature: glowcare-ai, Property 9: dermatologist flag triggers advisory message
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import AdviceCard from '../../components/AdviceCard';
import type { AdviceResponse, SkinType } from '../../types';

/**
 * Validates: Requirements 4.4
 * P9: For any AdviceResponse where dermatologistFlag is true, the rendered output
 * should contain the advisory message
 * "This concern may need professional attention — please consult a dermatologist."
 */

const ADVISORY_MESSAGE =
  'This concern may need professional attention — please consult a dermatologist.';

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
  dermatologistFlag: fc.constant(true),
});

describe('P9: Dermatologist flag triggers advisory message', () => {
  it('advisory message is present whenever dermatologistFlag is true', () => {
    fc.assert(
      fc.property(adviceResponseArb, (advice) => {
        const { unmount } = render(<AdviceCard advice={advice} />);
        try {
          const alert = screen.getByTestId('dermatologist-alert');
          return (
            alert !== null &&
            alert.textContent !== null &&
            alert.textContent.includes(ADVISORY_MESSAGE)
          );
        } finally {
          unmount();
        }
      }),
      { numRuns: 100 }
    );
  });
});

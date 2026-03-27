// Feature: glowcare-ai, Property P7: Skin type badge renders iff skinType is non-null
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import SkinTypeTag from '../../components/SkinTypeTag';
import type { SkinType } from '../../types';

const skinTypeArb = fc.constantFrom<SkinType>('Dry', 'Oily', 'Combination', 'Sensitive');
const nullableArb = fc.option(skinTypeArb, { nil: null });

/**
 * Validates: Requirements 3.2, 3.3
 * P7: The skin type badge renders if and only if skinType is non-null.
 */
describe('P7: Skin type badge renders iff skinType is non-null', () => {
  it('badge is present for every non-null SkinType and absent for null', () => {
    fc.assert(
      fc.property(nullableArb, (skinType) => {
        const { unmount } = render(<SkinTypeTag skinType={skinType} />);
        try {
          if (skinType !== null) {
            const tag = screen.getByTestId('skin-type-tag');
            return tag !== null && tag.textContent === `${skinType} Skin`;
          } else {
            return screen.queryByTestId('skin-type-tag') === null;
          }
        } finally {
          unmount();
        }
      }),
      { numRuns: 100 }
    );
  });
});

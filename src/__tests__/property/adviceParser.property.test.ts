// Feature: glowcare-ai, Property P6: Parsed skin type is always a valid value
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseLLMResponse } from '../../../server/services/parser';

/**
 * Validates: Requirements 3.1
 * P6: For any LLM JSON response processed by the parser, the resulting skinType
 * field must be one of "Dry", "Oily", "Combination", "Sensitive", or null —
 * never any other value.
 */

const VALID_SKIN_TYPES = ['Dry', 'Oily', 'Combination', 'Sensitive'] as const;

// Minimal valid AdviceResponse payload (all required fields except skinType)
function basePayload(skinType: unknown) {
  return {
    skinType,
    routine: { morning: ['step1'], night: ['step1'] },
    homeRemedies: ['remedy1'],
    productSuggestions: ['product1'],
    dosAndDonts: { dos: ['do1'], donts: ['dont1'] },
    dermatologistFlag: false,
  };
}

describe('P6: Parsed skin type is always a valid value', () => {
  it('returns a valid skinType for all valid enum values', () => {
    fc.assert(
      fc.property(fc.constantFrom(...VALID_SKIN_TYPES), (skinType) => {
        const json = JSON.stringify(basePayload(skinType));
        const result = parseLLMResponse(json);
        expect(VALID_SKIN_TYPES).toContain(result.skinType);
      }),
      { numRuns: 100 }
    );
  });

  it('returns null skinType when skinType is null in the JSON', () => {
    fc.assert(
      fc.property(fc.constant(null), (skinType) => {
        const json = JSON.stringify(basePayload(skinType));
        const result = parseLLMResponse(json);
        expect(result.skinType).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('throws for any invalid skinType string', () => {
    // Generate strings that are not valid skin type values
    const invalidSkinTypeArb = fc.string({ minLength: 1 }).filter(
      (s) => !(VALID_SKIN_TYPES as readonly string[]).includes(s)
    );

    fc.assert(
      fc.property(invalidSkinTypeArb, (invalidSkinType) => {
        const json = JSON.stringify(basePayload(invalidSkinType));
        expect(() => parseLLMResponse(json)).toThrow();
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: glowcare-ai, Property P8: All four advice sections present in parsed response

/**
 * Validates: Requirements 4.1
 * P8: For any valid LLM JSON response, the parser should produce an AdviceResponse
 * where routine (with morning and night arrays), homeRemedies, productSuggestions,
 * and dosAndDonts (with dos and donts arrays) are all present and non-empty arrays.
 */

const nonEmptyStringArray = fc.array(fc.string({ minLength: 1 }), { minLength: 1 });

function validLLMPayload(
  morning: string[],
  night: string[],
  homeRemedies: string[],
  productSuggestions: string[],
  dos: string[],
  donts: string[]
) {
  return {
    skinType: null,
    routine: { morning, night },
    homeRemedies,
    productSuggestions,
    dosAndDonts: { dos, donts },
    dermatologistFlag: false,
  };
}

describe('P8: All four advice sections present in parsed response', () => {
  it('all four sections are present and non-empty for any valid LLM JSON', () => {
    fc.assert(
      fc.property(
        nonEmptyStringArray,
        nonEmptyStringArray,
        nonEmptyStringArray,
        nonEmptyStringArray,
        nonEmptyStringArray,
        nonEmptyStringArray,
        (morning, night, homeRemedies, productSuggestions, dos, donts) => {
          const json = JSON.stringify(
            validLLMPayload(morning, night, homeRemedies, productSuggestions, dos, donts)
          );
          const result = parseLLMResponse(json);

          expect(Array.isArray(result.routine.morning)).toBe(true);
          expect(result.routine.morning.length).toBeGreaterThan(0);

          expect(Array.isArray(result.routine.night)).toBe(true);
          expect(result.routine.night.length).toBeGreaterThan(0);

          expect(Array.isArray(result.homeRemedies)).toBe(true);
          expect(result.homeRemedies.length).toBeGreaterThan(0);

          expect(Array.isArray(result.productSuggestions)).toBe(true);
          expect(result.productSuggestions.length).toBeGreaterThan(0);

          expect(Array.isArray(result.dosAndDonts.dos)).toBe(true);
          expect(result.dosAndDonts.dos.length).toBeGreaterThan(0);

          expect(Array.isArray(result.dosAndDonts.donts)).toBe(true);
          expect(result.dosAndDonts.donts.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

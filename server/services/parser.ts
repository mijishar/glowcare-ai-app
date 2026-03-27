import { AdviceResponse, SkinType } from '../types';

const VALID_SKIN_TYPES = new Set<string>(['Dry', 'Oily', 'Combination', 'Sensitive']);

function stripMarkdownFences(raw: string): string {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

export function parseLLMResponse(raw: string): AdviceResponse {
  const cleaned = stripMarkdownFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('[parser] Failed to parse LLM response. Raw output:', raw);
    throw new Error('LLM returned malformed JSON and could not be parsed.');
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('LLM response is not a JSON object.');
  }

  const obj = parsed as Record<string, unknown>;

  // Validate skinType
  const rawSkinType = obj.skinType;
  let skinType: SkinType;
  if (rawSkinType === null || rawSkinType === undefined) {
    skinType = null;
  } else if (typeof rawSkinType === 'string' && VALID_SKIN_TYPES.has(rawSkinType)) {
    skinType = rawSkinType as SkinType;
  } else {
    throw new Error(`Invalid skinType value: "${rawSkinType}". Must be one of Dry, Oily, Combination, Sensitive, or null.`);
  }

  // Validate routine
  const routine = obj.routine;
  if (typeof routine !== 'object' || routine === null || Array.isArray(routine)) {
    throw new Error('Missing or invalid "routine" field.');
  }
  const routineObj = routine as Record<string, unknown>;
  if (!isNonEmptyArray(routineObj.morning)) {
    throw new Error('"routine.morning" must be a non-empty array.');
  }
  if (!isNonEmptyArray(routineObj.night)) {
    throw new Error('"routine.night" must be a non-empty array.');
  }

  // Validate homeRemedies
  if (!isNonEmptyArray(obj.homeRemedies)) {
    throw new Error('"homeRemedies" must be a non-empty array.');
  }

  // Validate productSuggestions
  if (!isNonEmptyArray(obj.productSuggestions)) {
    throw new Error('"productSuggestions" must be a non-empty array.');
  }

  // Validate dosAndDonts
  const dosAndDonts = obj.dosAndDonts;
  if (typeof dosAndDonts !== 'object' || dosAndDonts === null || Array.isArray(dosAndDonts)) {
    throw new Error('Missing or invalid "dosAndDonts" field.');
  }
  const dadObj = dosAndDonts as Record<string, unknown>;
  if (!isNonEmptyArray(dadObj.dos)) {
    throw new Error('"dosAndDonts.dos" must be a non-empty array.');
  }
  if (!isNonEmptyArray(dadObj.donts)) {
    throw new Error('"dosAndDonts.donts" must be a non-empty array.');
  }

  // Validate dermatologistFlag
  if (typeof obj.dermatologistFlag !== 'boolean') {
    throw new Error('"dermatologistFlag" must be a boolean.');
  }

  return {
    skinType,
    routine: {
      morning: routineObj.morning as string[],
      night: routineObj.night as string[],
    },
    homeRemedies: obj.homeRemedies as string[],
    productSuggestions: obj.productSuggestions as string[],
    dosAndDonts: {
      dos: dadObj.dos as string[],
      donts: dadObj.donts as string[],
    },
    dermatologistFlag: obj.dermatologistFlag,
  };
}

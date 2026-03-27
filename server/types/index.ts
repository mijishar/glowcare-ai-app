export type SkinType = 'Dry' | 'Oily' | 'Combination' | 'Sensitive' | null;

export interface SkincareRoutine {
  morning: string[];
  night: string[];
}

export interface DosAndDonts {
  dos: string[];
  donts: string[];
}

export interface AdviceResponse {
  skinType: SkinType;
  routine: SkincareRoutine;
  homeRemedies: string[];
  productSuggestions: string[];
  dosAndDonts: DosAndDonts;
  dermatologistFlag: boolean;
}

export interface QueryHistoryEntry {
  id: string;
  timestamp: number;
  input: string;
  response: AdviceResponse;
}

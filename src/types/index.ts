export type SkinType = "Dry" | "Oily" | "Combination" | "Sensitive" | "Normal" | null;
export type SeverityLevel = "low" | "medium" | "high" | "none";

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

// --- Skin Analysis (photo) ---
export interface ProductRecommendation {
  name: string;
  keyIngredients: string[];
  whySuitable: string;
  howToUse: string;
}

export interface SkinAnalysisResult {
  skinType: SkinType;
  acne: SeverityLevel;
  pigmentation: SeverityLevel;
  darkCircles: SeverityLevel;
  healthScore: number;
  skinSummary?: string;
  routine?: { morning: string[]; night: string[] };
  dos?: string[];
  donts?: string[];
  naturalRemedies?: string[];
  productSuggestions?: string[];
  productRecommendations?: ProductRecommendation[];
  recommendations: string[];
  dermatologistFlag: boolean;
}

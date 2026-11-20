// src/features/candy/types/candy.types.ts

export type ISODateTimeString = string;

// --- OpenAPI Enums ---

export type CandyStatus = "PROPOSED" | "IN_BOWL" | "SCHEDULED" | "COMPLETED";

export type BudgetTier = "FREE" | "LOW" | "MEDIUM" | "HIGH";

export type WeatherCondition = "ANY" | "SUNNY" | "RAINY" | "NIGHT";

// --- Category (components.schemas.Category) ---

export interface CandyCategory {
  id: number;
  name: string;
  color_hex?: string;
  created_by: number | null;
}

export interface CreateCandyCategoryPayload {
  name: string;
  color_hex?: string;
}

// --- CandyPhoto (components.schemas.CandyPhoto) ---

export interface CandyPhoto {
  id: number;
  image: string;
  caption?: string;
  uploaded_by_username: string;
  uploaded_at: ISODateTimeString;
}

export interface UploadCandyPhotoPayload {
  image: File;
  caption?: string;
}

// --- Candy (components.schemas.Candy) ---

export interface Candy {
  id: number;
  bowl: number;
  category?: number | null;
  category_name: string;
  created_by: number;
  created_by_username: string;
  title: string;
  description?: string;
  status?: CandyStatus;
  start_date_time?: ISODateTimeString | null;
  duration?: string | null;
  budget?: BudgetTier;
  weather?: WeatherCondition;
  is_surprise?: boolean;
  reveal_at?: ISODateTimeString | null;
  is_revealed: boolean;
  is_expired: boolean;
  photos: CandyPhoto[];
  created_at: ISODateTimeString;
}

/** Request payload for POST /api/candies/ & PUT /api/candies/{id}/ (writable fields only) */
export interface CreateCandyPayload {
  bowl: number;
  title: string;
  category?: number | null;
  description?: string;
  status?: CandyStatus;
  start_date_time?: ISODateTimeString | null;
  duration?: string | null;
  budget?: BudgetTier;
  weather?: WeatherCondition;
  is_surprise?: boolean;
  reveal_at?: ISODateTimeString | null;
}

export type UpdateCandyPayload = CreateCandyPayload;

/** Request payload for PATCH /api/candies/{id}/ (components.schemas.PatchedCandy writable fields) */
export type PatchedCandyPayload = Partial<CreateCandyPayload>;

// --- Feature-Specific Query & Action Helpers (Req #7, #9, #11, #12) ---

export interface CandyListParams {
  bowl?: number;
  category?: number;
  status?: CandyStatus;
  budget?: BudgetTier;
  weather?: WeatherCondition;
  is_expired?: boolean;
  is_surprise?: boolean;
  search?: string;
}

export interface DateRouletteFilter {
  bowl: number;
  budget?: BudgetTier;
  weather?: WeatherCondition;
  duration?: string;
  category?: number;
}

export type SwipeDirection = "LEFT" | "RIGHT";

export interface CandySwipePayload {
  direction: SwipeDirection;
  start_date_time?: ISODateTimeString | null;
}

export interface CandySwipeResult {
  candy: Candy;
  matched: boolean;
}

export interface DailyPrompt {
  id: number;
  bowl: number;
  prompt_date: string; // YYYY-MM-DD
  question: string;
  is_revealed: boolean;
  my_answer?: string | null;
  partner_answer?: string | null;
}

export interface SubmitDailyPromptPayload {
  answer: string;
}
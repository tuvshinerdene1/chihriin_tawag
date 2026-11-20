// src/features/candy/api/candy.api.ts
import { api } from "@/lib/axios";
import type {
  Candy,
  CandyCategory,
  CandyListParams,
  CandySwipePayload,
  CandySwipeResult,
  CreateCandyCategoryPayload,
  CreateCandyPayload,
  DateRouletteFilter,
  PatchedCandyPayload,
  UpdateCandyPayload,
  UploadCandyPhotoPayload,
} from "../types/candy.types";

const CANDIES_BASE_PATH = "/api/candies";

function buildPhotoFormData(payload: UploadCandyPhotoPayload): FormData {
  const formData = new FormData();
  formData.append("image", payload.image);
  if (payload.caption !== undefined && payload.caption !== "") {
    formData.append("caption", payload.caption);
  }
  return formData;
}

export const candyApi = {
  /** GET /api/candies/ */
  list(params?: CandyListParams): Promise<Candy[]> {
    return api.get(`${CANDIES_BASE_PATH}/`, { params }) as Promise<Candy[]>;
  },

  /** POST /api/candies/ */
  create(payload: CreateCandyPayload): Promise<Candy> {
    return api.post(`${CANDIES_BASE_PATH}/`, payload) as Promise<Candy>;
  },

  /** GET /api/candies/{id}/ */
  retrieve(id: number): Promise<Candy> {
    return api.get(`${CANDIES_BASE_PATH}/${id}/`) as Promise<Candy>;
  },

  /** PUT /api/candies/{id}/ */
  update(id: number, payload: UpdateCandyPayload): Promise<Candy> {
    return api.put(`${CANDIES_BASE_PATH}/${id}/`, payload) as Promise<Candy>;
  },

  /** PATCH /api/candies/{id}/ */
  patch(id: number, payload: PatchedCandyPayload): Promise<Candy> {
    return api.patch(`${CANDIES_BASE_PATH}/${id}/`, payload) as Promise<Candy>;
  },

  /** DELETE /api/candies/{id}/ */
  remove(id: number): Promise<void> {
    return api.delete(`${CANDIES_BASE_PATH}/${id}/`) as Promise<void>;
  },

  /** POST /api/candies/{id}/photos/ (multipart/form-data) */
  uploadPhoto(id: number, payload: UploadCandyPhotoPayload): Promise<Candy> {
    const formData = buildPhotoFormData(payload);
    return api.post(`${CANDIES_BASE_PATH}/${id}/photos/`, formData, {
      // Override instance default "application/json" so boundary is set automatically
      headers: {
        "Content-Type": undefined,
      },
    }) as Promise<Candy>;
  },

  /** POST /api/candies/{id}/swipe/ */
  swipe(id: number, payload: CandySwipePayload): Promise<CandySwipeResult | Candy> {
    return api.post(
      `${CANDIES_BASE_PATH}/${id}/swipe/`,
      payload
    ) as Promise<CandySwipeResult | Candy>;
  },

  /** GET /api/candies/calendar/ */
  getCalendar(params?: CandyListParams): Promise<Candy[]> {
    return api.get(`${CANDIES_BASE_PATH}/calendar/`, {
      params,
    }) as Promise<Candy[]>;
  },

  /** GET /api/candies/roulette/ */
  rollRoulette(params: DateRouletteFilter): Promise<Candy> {
    return api.get(`${CANDIES_BASE_PATH}/roulette/`, {
      params,
    }) as Promise<Candy>;
  },

  /** GET /api/bowls/{bowlId}/categories/ */
  listCategories(bowlId: number): Promise<CandyCategory[]> {
    return api.get(`/api/bowls/${bowlId}/categories/`) as Promise<CandyCategory[]>;
  },

  /** POST /api/bowls/{bowlId}/categories/ */
  createCategory(
    bowlId: number,
    payload: CreateCandyCategoryPayload
  ): Promise<CandyCategory> {
    return api.post(
      `/api/bowls/${bowlId}/categories/`,
      payload
    ) as Promise<CandyCategory>;
  },
};
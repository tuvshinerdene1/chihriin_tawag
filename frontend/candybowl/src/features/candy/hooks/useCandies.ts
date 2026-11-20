// src/features/candy/hooks/use-candy.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candyApi } from "../api/candy.api";
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

export interface ApiErrorShape {
  status?: number;
  message: string;
  errors?: Record<string, unknown>;
}

export const CANDY_QUERY_KEYS = {
  all: ["candies"] as const,
  lists: () => [...CANDY_QUERY_KEYS.all, "list"] as const,
  list: (params?: CandyListParams) => [...CANDY_QUERY_KEYS.lists(), params] as const,
  calendar: (params?: CandyListParams) =>
    [...CANDY_QUERY_KEYS.all, "calendar", params] as const,
  details: () => [...CANDY_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...CANDY_QUERY_KEYS.details(), id] as const,
  categories: (bowlId: number) =>
    ["bowls", bowlId, "categories"] as const,
};

// --- Queries ---

export function useCandies(params?: CandyListParams) {
  return useQuery<Candy[], ApiErrorShape>({
    queryKey: CANDY_QUERY_KEYS.list(params),
    queryFn: () => candyApi.list(params),
  });
}

export function useCandy(id: number | null | undefined) {
  return useQuery<Candy, ApiErrorShape>({
    queryKey: CANDY_QUERY_KEYS.detail(id ?? 0),
    queryFn: () => candyApi.retrieve(id as number),
    enabled: typeof id === "number" && id > 0,
  });
}

export function useCandyCalendar(params?: CandyListParams) {
  return useQuery<Candy[], ApiErrorShape>({
    queryKey: CANDY_QUERY_KEYS.calendar(params),
    queryFn: () => candyApi.getCalendar(params),
  });
}

export function useBowlCategories(bowlId: number | null | undefined) {
  return useQuery<CandyCategory[], ApiErrorShape>({
    queryKey: CANDY_QUERY_KEYS.categories(bowlId ?? 0),
    queryFn: () => candyApi.listCategories(bowlId as number),
    enabled: typeof bowlId === "number" && bowlId > 0,
  });
}

// --- Mutations ---

export function useCreateCandy() {
  const queryClient = useQueryClient();

  return useMutation<Candy, ApiErrorShape, CreateCandyPayload>({
    mutationFn: (payload) => candyApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CANDY_QUERY_KEYS.lists() }),
        queryClient.invalidateQueries({ queryKey: ["candies", "calendar"] }),
      ]);
    },
  });
}

export function useUpdateCandy(id: number) {
  const queryClient = useQueryClient();

  return useMutation<Candy, ApiErrorShape, UpdateCandyPayload>({
    mutationFn: (payload) => candyApi.update(id, payload),
    onSuccess: async (updated) => {
      queryClient.setQueryData(CANDY_QUERY_KEYS.detail(id), updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CANDY_QUERY_KEYS.lists() }),
        queryClient.invalidateQueries({ queryKey: ["candies", "calendar"] }),
      ]);
    },
  });
}

export function usePatchCandy() {
  const queryClient = useQueryClient();

  return useMutation<
    Candy,
    ApiErrorShape,
    { id: number; payload: PatchedCandyPayload }
  >({
    mutationFn: ({ id, payload }) => candyApi.patch(id, payload),
    onSuccess: async (updated, { id }) => {
      queryClient.setQueryData(CANDY_QUERY_KEYS.detail(id), updated);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CANDY_QUERY_KEYS.lists() }),
        queryClient.invalidateQueries({ queryKey: ["candies", "calendar"] }),
      ]);
    },
  });
}

export function useDeleteCandy() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiErrorShape, number>({
    mutationFn: (id) => candyApi.remove(id),
    onSuccess: async (_, id) => {
      queryClient.removeQueries({ queryKey: CANDY_QUERY_KEYS.detail(id) });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CANDY_QUERY_KEYS.lists() }),
        queryClient.invalidateQueries({ queryKey: ["candies", "calendar"] }),
      ]);
    },
  });
}

export function useUploadCandyPhoto(candyId: number) {
  const queryClient = useQueryClient();

  return useMutation<Candy, ApiErrorShape, UploadCandyPhotoPayload>({
    mutationFn: (payload) => candyApi.uploadPhoto(candyId, payload),
    onSuccess: async (updatedCandy) => {
      queryClient.setQueryData(CANDY_QUERY_KEYS.detail(candyId), updatedCandy);
      await queryClient.invalidateQueries({ queryKey: CANDY_QUERY_KEYS.lists() });
    },
  });
}

export function useSwipeCandy(candyId: number) {
  const queryClient = useQueryClient();

  return useMutation<CandySwipeResult | Candy, ApiErrorShape, CandySwipePayload>({
    mutationFn: (payload) => candyApi.swipe(candyId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: CANDY_QUERY_KEYS.lists() }),
        queryClient.invalidateQueries({ queryKey: ["candies", "calendar"] }),
        queryClient.invalidateQueries({ queryKey: CANDY_QUERY_KEYS.detail(candyId) }),
      ]);
    },
  });
}

export function useRollDateRoulette() {
  return useMutation<Candy, ApiErrorShape, DateRouletteFilter>({
    mutationFn: (params) => candyApi.rollRoulette(params),
  });
}

export function useCreateBowlCategory(bowlId: number) {
  const queryClient = useQueryClient();

  return useMutation<CandyCategory, ApiErrorShape, CreateCandyCategoryPayload>({
    mutationFn: (payload) => candyApi.createCategory(bowlId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: CANDY_QUERY_KEYS.categories(bowlId),
      });
    },
  });
}
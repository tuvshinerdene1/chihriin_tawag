// src/features/auth/hooks/use-auth.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { tokenStorage } from "@/lib/axios";
import { authApi, LoginPayload, RegisterPayload } from "../api/auth.api";
import { ApiFieldError } from "../types/auth.types";

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
};

export function useMe() {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: authApi.getMe,
    enabled: Boolean(tokenStorage.getAccess()),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<Awaited<ReturnType<typeof authApi.login>>, ApiFieldError, LoginPayload>({
    mutationFn: authApi.login,
    onSuccess: async (tokens) => {
      tokenStorage.setTokens(tokens.access, tokens.refresh);
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      router.push("/candies");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation<Awaited<ReturnType<typeof authApi.register>>, ApiFieldError, RegisterPayload>({
    mutationFn: authApi.register,
    onSuccess: () => {
      router.push("/login?registered=true");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    tokenStorage.clear();
    queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me });
    router.push("/login");
  };
}
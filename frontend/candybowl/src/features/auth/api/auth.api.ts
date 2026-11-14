// src/features/auth/api/auth.api.ts
import { api } from "@/lib/axios";
import {
  RegisterResponse,
  TokenObtainPairResponse,
  UserProfile,
} from "../types/auth.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}

export const authApi = {
  login: (payload: LoginPayload): Promise<TokenObtainPairResponse> =>
    api.post("/api/accounts/login/", payload),

  register: (payload: RegisterPayload): Promise<RegisterResponse> =>
    api.post("/api/accounts/register/", payload),

  getMe: (): Promise<UserProfile> =>
    api.get("/api/accounts/me/"),

  updateMe: (payload: Partial<Pick<UserProfile, "username">>): Promise<UserProfile> =>
    api.patch("/api/accounts/me/", payload),

  changePassword: (payload: ChangePasswordPayload): Promise<void> =>
    api.post("/api/accounts/change-password/", payload),
};
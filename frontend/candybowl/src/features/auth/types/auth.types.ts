// src/features/auth/types/auth.types.ts
export interface TokenObtainPairResponse {
  access: string;
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string; // Present if ROTATE_REFRESH_TOKENS=True in SimpleJWT
}

export interface UserProfile {
  id: number | string;
  email: string;
  username: string;
}

export interface RegisterResponse {
  id?: number | string;
  email: string;
  username: string;
}

export interface ApiFieldError {
  status?: number;
  message: string;
  errors: Record<string, string[] | string>;
}
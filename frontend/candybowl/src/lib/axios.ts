// src/lib/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const tokenStorage = {
  getAccess: () => (typeof window !== "undefined" ? localStorage.getItem("access_token") : null),
  getRefresh: () => (typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null),
  setTokens: (access: string, refresh?: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem("access_token", access);
    if (refresh) localStorage.setItem("refresh_token", refresh);
    // Optional: mirror a flag cookie for Next.js middleware route protection
    document.cookie = `auth_present=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  },
  clear: () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    document.cookie = "auth_present=; path=/; max-age=0";
  },
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError<Record<string, unknown>>) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/accounts/login/") &&
      !originalRequest.url?.includes("/api/accounts/token/refresh/")
    ) {
      originalRequest._retry = true;
      const refresh = tokenStorage.getRefresh();

      if (refresh) {
        try {
          const { data } = await axios.post<{ access: string; refresh?: string }>(
            `${api.defaults.baseURL}/api/accounts/token/refresh/`,
            { refresh }
          );
          tokenStorage.setTokens(data.access, data.refresh);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch {
          tokenStorage.clear();
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      }
    }

    const data = error.response?.data;
    const message =
      (typeof data?.detail === "string" && data.detail) ||
      (typeof data?.message === "string" && data.message) ||
      error.message ||
      "Request failed";

    return Promise.reject({
      status: error.response?.status,
      message,
      errors: data || {},
    });
  }
);
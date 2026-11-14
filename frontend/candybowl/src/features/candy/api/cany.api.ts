import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true, // Required if your Django backend uses session cookies or CORS with credentials
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor for adding tokens (if using Bearer tokens instead of HttpOnly cookies)
api.interceptors.request.use(
  (config) => {
    // Optional: Attach token from localStorage if you store it there
    // const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response.data, // Return data directly to avoid repetitive .data unwrapping
  (error) => {
    const customError = {
      status: error.response?.status,
      message: error.response?.data?.detail || error.response?.data?.message || error.message || "An unexpected error occurred",
      errors: error.response?.data || {},
    };

    // Handle global redirects on session expiry if needed
    if (customError.status === 401 && typeof window !== "undefined") {
      // window.location.href = '/login';
    }

    return Promise.reject(customError);
  }
);

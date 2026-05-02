import axios from "axios";
import {
  clearAuthSession,
  getStoredAccessToken,
  persistAuthSession,
} from "@/features/auth/authStorage";
import type { AuthResponse } from "@/features/auth/auth.api";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",   // ✅ explicit — never rely on axios inference
  },
});

let refreshPromise: Promise<AuthResponse> | null = null;

const refreshAuthSession = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  refreshPromise ??= axios
    .post<AuthResponse>(`${apiUrl}/v1/auth/refresh`, {}, { withCredentials: true })
    .then((response) => response.data)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = getStoredAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    const status =
      axios.isAxiosError(error) ? error.response?.status : undefined;
    const originalRequest = axios.isAxiosError(error)
      ? error.config
      : undefined;

    const requestUrl = originalRequest?.url ?? "";
    const isAuthRequest =
      requestUrl.includes("/v1/auth/login") ||
      requestUrl.includes("/v1/auth/register") ||
      requestUrl.includes("/v1/auth/refresh") ||
      requestUrl.includes("/v1/auth/logout");

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest.headers?.["x-auth-retry"] &&
      !isAuthRequest
    ) {
      try {
        const refreshedSession = await refreshAuthSession();

        persistAuthSession(
          refreshedSession.accessToken,
          refreshedSession.user
        );

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${refreshedSession.accessToken}`;
        originalRequest.headers["x-auth-retry"] = "1";

        return api(originalRequest);
      } catch (refreshError) {
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;

        if (refreshStatus === 401 || refreshStatus === 403) {
          clearAuthSession();
        }
      }
    }

    if (status === 401 && typeof window !== "undefined") {
      const next = encodeURIComponent(window.location.pathname);
      window.location.href = `/login?next=${next}`;
    }

    return Promise.reject(error);
  }
);

export default api;

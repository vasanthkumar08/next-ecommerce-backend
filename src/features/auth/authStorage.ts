import type { User } from "./auth.api";

const AUTH_TOKEN_KEY = "vasanthtrends.accessToken";
const AUTH_USER_KEY = "vasanthtrends.user";
const ACCESS_COOKIE_NAME = "accessToken";
const ACCESS_COOKIE_MAX_AGE_SECONDS = 15 * 60;

const canUseStorage = () => typeof window !== "undefined";

const getCookieSecurity = () =>
  window.location.protocol === "https:" ? "; Secure" : "";

export const persistAccessTokenCookie = (accessToken: string) => {
  if (!canUseStorage()) return;

  document.cookie = `${ACCESS_COOKIE_NAME}=${encodeURIComponent(
    accessToken
  )}; path=/; max-age=${ACCESS_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${getCookieSecurity()}`;
};

export const clearAccessTokenCookie = () => {
  if (!canUseStorage()) return;
  document.cookie = `${ACCESS_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${getCookieSecurity()}`;
};

export const getStoredAccessToken = (): string | null => {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getStoredUser = (): User | null => {
  if (!canUseStorage()) return null;

  const rawUser = window.localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    window.localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const persistAuthSession = (accessToken: string, user: User) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  persistAccessTokenCookie(accessToken);
};

export const clearAuthSession = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  clearAccessTokenCookie();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    void fetch(`${apiUrl}/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
    }).catch(() => undefined);
  }
};

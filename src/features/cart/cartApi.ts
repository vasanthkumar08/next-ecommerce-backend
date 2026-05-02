import type { User } from "../auth/auth.api";

const AUTH_TOKEN_KEY = "vasanthtrends.accessToken";
const AUTH_USER_KEY = "vasanthtrends.user";

const canUseStorage = () => typeof window !== "undefined";

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
};

export const clearAuthSession = () => {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
};

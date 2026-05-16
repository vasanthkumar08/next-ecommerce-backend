import { randomBytes } from "node:crypto";
import type { Response } from "express";

const isProduction = process.env.NODE_ENV === "production";

export const authCookieNames = {
  access: "accessToken",
  refresh: "refreshToken",
  csrf: "csrfToken",
} as const;

const accessMaxAgeMs = 15 * 60 * 1000;
const refreshMaxAgeMs = 7 * 24 * 60 * 60 * 1000;
const rememberedRefreshMaxAgeMs = 30 * 24 * 60 * 60 * 1000;

export const createCsrfToken = (): string => randomBytes(32).toString("base64url");

export const setAuthCookies = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string; csrfToken?: string },
  rememberMe: boolean
): void => {
  // Tokens are intentionally HTTP-only so XSS cannot directly read bearer
  // credentials. The non-HTTP-only CSRF cookie is a double-submit nonce, not a
  // credential, and is safe for the browser to echo in a header.
  res.cookie(authCookieNames.access, tokens.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAgeMs,
  });

  res.cookie(authCookieNames.refresh, tokens.refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: rememberMe ? rememberedRefreshMaxAgeMs : refreshMaxAgeMs,
  });

  res.cookie(authCookieNames.csrf, tokens.csrfToken ?? createCsrfToken(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: rememberMe ? rememberedRefreshMaxAgeMs : refreshMaxAgeMs,
  });
};

export const clearAuthCookies = (res: Response): void => {
  const base = {
    secure: isProduction,
    path: "/",
  };

  res.clearCookie(authCookieNames.access, { ...base, sameSite: "lax" });
  res.clearCookie(authCookieNames.refresh, { ...base, sameSite: "strict" });
  res.clearCookie(authCookieNames.csrf, { ...base, sameSite: "lax" });
};

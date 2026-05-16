import type { NextFunction, Request, Response } from "express";
import { authCookieNames } from "../auth/cookies.js";
import logger from "../../utils/logger.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const csrfExemptPaths = new Set([
  "/api/v1/auth/login",
  "/api/v1/auth/oauth/session",
  "/api/v1/auth/register",
  "/api/v1/auth/refresh",
  "/api/v1/payments/webhook",
  "/v1/auth/login",
  "/v1/auth/oauth/session",
  "/v1/auth/register",
  "/v1/auth/refresh",
  "/v1/payments/webhook",
]);

const logoutPaths = new Set(["/api/v1/auth/logout", "/v1/auth/logout"]);

const hasAuthCookie = (req: Request): boolean =>
  typeof req.cookies?.[authCookieNames.access] === "string" ||
  typeof req.cookies?.[authCookieNames.refresh] === "string" ||
  typeof req.cookies?.[authCookieNames.csrf] === "string";

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestPath = req.path;

  if (!unsafeMethods.has(req.method) || csrfExemptPaths.has(requestPath)) {
    next();
    return;
  }

  if (logoutPaths.has(requestPath) && !hasAuthCookie(req)) {
    // Logout must be idempotent: after a successful logout the browser no
    // longer has the CSRF cookie, so duplicate UI events should become a no-op.
    // Authenticated logout still requires the normal CSRF cookie/header pair.
    logger.info("csrf_logout_noop_without_auth_cookies", {
      requestId: req.requestId,
      path: requestPath,
    });
    next();
    return;
  }

  const cookieToken = req.cookies?.[authCookieNames.csrf];
  const headerToken = req.headers["x-csrf-token"];

  if (
    typeof cookieToken === "string" &&
    typeof headerToken === "string" &&
    cookieToken.length > 0 &&
    cookieToken === headerToken
  ) {
    next();
    return;
  }

  logger.warn("csrf_validation_failed", {
    requestId: req.requestId,
    path: requestPath,
    hasCsrfCookie: typeof cookieToken === "string" && cookieToken.length > 0,
    hasCsrfHeader: typeof headerToken === "string" && headerToken.length > 0,
    hasAuthCookie: hasAuthCookie(req),
  });

  res.status(403).json({
    success: false,
    message: "CSRF validation failed",
  });
};

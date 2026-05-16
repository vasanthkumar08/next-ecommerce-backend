import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import * as authService from "./auth.service.js";
import type { IUser } from "../user/user.model.js";
import type { PublicUser } from "./auth.types.js";
import { authCookieNames, clearAuthCookies, setAuthCookies } from "../../lib/auth/cookies.js";
import { getRequestContext } from "../../lib/auth/requestContext.js";
import AppError from "../../utils/AppError.js";
import env from "../../config/env.js";

const sanitizeUser = (user: IUser): PublicUser => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
});

const sendAuthResponse = (
  res: Response,
  statusCode: number,
  message: string,
  auth: {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
    rememberMe: boolean;
  }
) => {
  const csrfToken = setAuthCookies(
    res,
    {
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
    },
    auth.rememberMe
  );

  // The legacy `accessToken` response field is kept for API compatibility.
  // Browser code should rely on HTTP-only cookies instead of reading it.
  return res.status(statusCode).json({
    success: true,
    message,
    accessToken: auth.accessToken,
    csrfToken,
    user: auth.user,
  });
};

const isInternalAuthRequest = (req: Request): boolean => {
  const incoming = req.headers["x-auth-internal-secret"];

  if (typeof incoming !== "string" || incoming.length === 0) return false;

  const expected = env.AUTH_INTERNAL_SECRET;
  const incomingBuffer = Buffer.from(incoming);
  const expectedBuffer = Buffer.from(expected);

  return (
    incomingBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(incomingBuffer, expectedBuffer)
  );
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await authService.registerUser(req.body, getRequestContext(req));

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const auth = await authService.loginUser(req.body, getRequestContext(req));
    return sendAuthResponse(res, 200, "Logged in successfully", auth);
  } catch (err) {
    next(err);
  }
};

export const oauthSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!isInternalAuthRequest(req)) {
      throw new AppError("Unauthorized OAuth session bridge", 401);
    }

    const auth = await authService.oauthLoginUser(req.body, getRequestContext(req));
    return sendAuthResponse(res, 200, "OAuth session established", auth);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[authCookieNames.refresh];

    if (typeof token !== "string") {
      console.info("auth_refresh_cookie_missing", {
        requestId: req.requestId,
        origin: req.headers.origin,
        hasCookieHeader: typeof req.headers.cookie === "string",
      });

      return res.status(401).json({
        success: false,
        message: "No refresh token",
      });
    }

    console.info("auth_refresh_started", {
      requestId: req.requestId,
      origin: req.headers.origin,
      hasRefreshCookie: true,
    });

    const auth = await authService.refreshTokenService(
      token,
      getRequestContext(req)
    );

    return sendAuthResponse(res, 200, "Session refreshed", auth);
  } catch (err) {
    clearAuthCookies(res);
    next(err);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.[authCookieNames.refresh];
    await authService.logoutUser(
      typeof token === "string" ? token : undefined,
      getRequestContext(req)
    );

    clearAuthCookies(res);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    clearAuthCookies(res);
    next(err);
  }
};

export const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);

    await authService.logoutAllDevices(req.user._id, getRequestContext(req));
    clearAuthCookies(res);

    res.json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (err) {
    next(err);
  }
};

export const sessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);
    const data = await authService.listActiveSessions(req.user._id);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const revokeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);

    const sessionId =
      typeof req.params.sessionId === "string" ? req.params.sessionId : "";

    await authService.revokeSession(
      req.user._id,
      sessionId,
      getRequestContext(req)
    );

    res.json({ success: true, message: "Session revoked" });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.forgotPassword(
      req.body.email,
      getRequestContext(req)
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.password,
      getRequestContext(req)
    );
    clearAuthCookies(res);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const requestEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);
    const result = await authService.requestEmailVerification(
      req.user._id,
      getRequestContext(req)
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await authService.verifyEmail(
      req.body.token,
      getRequestContext(req)
    );
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

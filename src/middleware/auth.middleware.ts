import { Request, Response, NextFunction } from "express";
import { authCookieNames } from "../lib/auth/cookies.js";
import { resolveAuthSessionFromToken } from "../lib/auth/resolveSession.js";

/**
 * 🔐 Protect Middleware (Authentication)
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && typeof req.cookies?.[authCookieNames.access] === "string") {
      token = req.cookies[authCookieNames.access];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
      return;
    }

    const authSession = await resolveAuthSessionFromToken(token);

    if (!authSession) {
      res.status(401).json({
        success: false,
        message: "Session expired",
      });
      return;
    }

    req.user = {
      _id: authSession.userId,
      role: authSession.role,
      email: authSession.email,
      sessionId: authSession.sessionId,
    };

    next();
  } catch (error: unknown) {
    const typedError = error as { name?: string };
    if (typedError.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
      return;
    }

    if (typedError.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    next(error);
  }
};

/**
 * 🔥 Role-based Authorization
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!req.user.role || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
};

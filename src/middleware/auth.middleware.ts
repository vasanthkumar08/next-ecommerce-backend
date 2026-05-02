import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../modules/user/user.model";
import { verifyAccessToken } from "../utils/jwt";

/**
 * 🔐 Token Payload Type
 */
type DecodedToken = jwt.JwtPayload & {
  id?: string;
  sub?: string;
  role?: string;
};

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

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
      return;
    }

    const decoded = verifyAccessToken(token) as DecodedToken;

    // ✅ Check if user exists
    const userId = decoded.id ?? decoded.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
      return;
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      role: user.role,
      email: user.email,
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

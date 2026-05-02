import { Request, Response, NextFunction } from "express";
import AppError from "./AppError";

/**
 * 🚀 Async Wrapper (Production Safe)
 */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      let error = err;

      // 🔄 Normalize unknown errors
      if (!(error instanceof AppError)) {
        error = new AppError(
          error.message || "Internal Server Error",
          error.statusCode || 500
        );
        error.isOperational = false;
      }

      // 🧠 Dev logging only
      if (process.env.NODE_ENV === "development") {
        console.error("ASYNC ERROR 🚨:", {
          path: req.originalUrl,
          method: req.method,
          message: error.message,
        });
      }

      next(error);
    });
  };

export default asyncHandler;
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";

/**
 * 🔧 Custom Error Type
 */
interface AppErrorType extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: number | string;
  details?: unknown;
}

/* ===================== ERROR HANDLERS ===================== */

const handleCastError = (err: any): AppError =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateError = (err: any): AppError => {
  const field = Object.keys(err.keyValue).join(", ");
  return new AppError(`Duplicate field value: ${field}`, 400);
};

const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((e: any) => e.message);
  return new AppError("Validation failed", 400, { details: errors });
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token", 401);

const handleJWTExpired = (): AppError =>
  new AppError("Token expired", 401);

/* ===================== RESPONSE HANDLERS ===================== */

const sendDevError = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    code: err.code ?? null,
    details: err.details ?? null,
    stack: err.stack,
  });
};

const sendProdError = (err: AppError, res: Response): void => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      code: err.code ?? null,
    });
    return;
  }

  console.error("💥 UNEXPECTED ERROR:", err);

  res.status(500).json({
    success: false,
    status: "error",
    message: "Something went wrong",
  });
};

/* ===================== GLOBAL ERROR MIDDLEWARE ===================== */

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error: AppError;

  // ✅ Ensure AppError instance
  if (err instanceof AppError) {
    error = err;
  } else {
    error = new AppError(err.message || "Internal Server Error", 500);
    error.isOperational = false;
  }

  // 🔥 Handle specific errors (IMPORTANT: use original err)
  if (err.name === "CastError") error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateError(err);
  if (err.name === "ValidationError") error = handleValidationError(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpired();

  // 🌍 Environment-based response
  if (process.env.NODE_ENV === "development") {
    return sendDevError(error, res);
  }

  sendProdError(error, res);
};

export default errorMiddleware;
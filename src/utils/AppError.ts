export interface AppErrorOptions {
  code?: string | number | null;
  details?: any;
}

/**
 * 🚨 Custom Application Error
 */
class AppError extends Error {
  public statusCode: number;
  public status: "fail" | "error";
  public isOperational: boolean;
  public code: string | number | null;
  public details: any;

  constructor(
    message: string,
    statusCode: number = 500,
    options: AppErrorOptions = {}
  ) {
    super(message);

    this.statusCode = statusCode;

    // ✅ status type (4xx = fail, 5xx = error)
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    // ✅ operational error flag
    this.isOperational = true;

    // ✅ optional metadata
    this.code = options.code ?? null;
    this.details = options.details ?? null;

    // 🧠 clean stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
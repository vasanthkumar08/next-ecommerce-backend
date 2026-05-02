import { Response } from "express";

/**
 * ✅ Unified response utility
 * Usage: sendResponse(res, 200, "Message", data)
 */
export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data: data ?? null,
  });
};
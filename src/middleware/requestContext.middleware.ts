import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import logger from "../utils/logger.js";

export const requestContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const incomingRequestId = req.headers["x-request-id"]?.toString().trim();
  const requestId =
    incomingRequestId && incomingRequestId.length <= 128
      ? incomingRequestId
      : randomUUID();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    logger.info("http_request", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
  });

  next();
};

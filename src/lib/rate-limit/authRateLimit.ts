import type { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "../../config/redis.js";

const clientKey = (req: Request): string =>
  req.user?._id ??
  req.headers["x-forwarded-for"]?.toString().split(",")[0] ??
  req.socket.remoteAddress ??
  req.ip ??
  "anonymous";

const createAuthLimiter = (points: number, duration: number, prefix: string) =>
  new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: prefix,
    points,
    duration,
  });

export const loginLimiter = createAuthLimiter(5, 10 * 60, "auth_login");
export const registerLimiter = createAuthLimiter(5, 10 * 60, "auth_register");
export const refreshLimiter = createAuthLimiter(20, 15 * 60, "auth_refresh");
export const passwordResetLimiter = createAuthLimiter(
  3,
  15 * 60,
  "auth_password_reset"
);

export const enforceRateLimit =
  (limiter: RateLimiterRedis) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await limiter.consume(clientKey(req));
      next();
    } catch (error) {
      const rateLimitError = error as { msBeforeNext?: number };

      if (rateLimitError.msBeforeNext) {
        res.status(429).json({
          success: false,
          message: "Too many requests",
          retryAfter: Math.ceil(rateLimitError.msBeforeNext / 1000),
        });
        return;
      }

      // Authentication remains available during Redis incidents, while the
      // incident is visible in logs for operators.
      console.error("Auth rate limiter failed:", error);
      next();
    }
  };

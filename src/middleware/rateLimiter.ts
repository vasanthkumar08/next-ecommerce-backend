import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import redis from "../config/redis.js";

/**
 * 🧠 Create Rate Limiter
 */
const createLimiter = (points: number, duration: number) => {
  return new RateLimiterRedis({
    storeClient: redis,
    keyPrefix: "rl",
    points,
    duration,
  });
};

/* ===================== LIMITERS ===================== */

export const apiLimiter = createLimiter(100, 60);
export const authLimiter = createLimiter(10, 15 * 60);
export const cartLimiter = createLimiter(30, 60);
export const orderLimiter = createLimiter(10, 60);
export const productLimiter = createLimiter(200, 60);

/* ===================== TYPES ===================== */

/* ===================== SAFE KEY GENERATOR ===================== */

const getClientKey = (req: Request): string => {
  return (
    req.user?._id || // logged-in user
    req.headers["x-forwarded-for"]?.toString().split(",")[0] || // proxy IP
    req.socket?.remoteAddress || // fallback
    req.ip || // express fallback
    "anonymous" // last fallback
  );
};

/* ===================== MIDDLEWARE ===================== */

export const rateLimitMiddleware =
  (limiter: RateLimiterRedis) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = getClientKey(req);

      await limiter.consume(key);

      next();
    } catch (err: unknown) {
      const typedErr = err as { msBeforeNext?: number };
      /**
       * 🔥 IMPORTANT: differentiate error types
       */
      if (typedErr?.msBeforeNext) {
        res.status(429).json({
          success: false,
          message: "Too many requests",
          retryAfter: Math.ceil(typedErr.msBeforeNext / 1000),
        });
        return;
      }

      /**
       * ❗ Redis failure → DON'T BLOCK REQUEST
       * (Amazon-style resilience)
       */
      console.error("Rate limiter error:", err);

      next(); // allow request instead of breaking app
    }
  };
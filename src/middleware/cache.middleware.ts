import { Request, Response, NextFunction } from "express";
import redis from "../config/redis.js";

/**
 * 📦 Cached Response Shape
 */
interface CachedResponse<T = unknown> {
  success: boolean;
  source?: "cache" | "live";
  data: T;
}

/**
 * 🧠 Extend Response safely
 */
interface CacheResponse extends Response {
  _originalJson?: Response["json"];
}

/* ===================== HELPERS ===================== */

/**
 * Normalize URL to avoid duplicate cache keys
 */
const normalizeUrl = (req: Request): string => {
  const url = new URL(req.originalUrl, `http://${req.headers.host}`);
  const sortedParams = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

  return `${url.pathname}?${sortedParams}`;
};

/* ===================== CACHE MIDDLEWARE ===================== */

export const cache = (keyPrefix: string, ttl = 60) => {
  return async (
    req: Request,
    res: CacheResponse,
    next: NextFunction
  ): Promise<void> => {
    try {
      const normalizedUrl = normalizeUrl(req);
      const key = `${keyPrefix}:${normalizedUrl}`;

      // 🔍 check cache
      const cached = await redis.get(key);

      if (cached) {
        const parsed: CachedResponse = JSON.parse(cached);

        res.status(200).json({
          success: true,
          source: "cache",
          data: parsed.data,
        });

        return;
      }

      // 💾 store original json
      res._originalJson = res.json.bind(res);

      res.json = (body: any) => {
        // only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cachePayload: CachedResponse = {
            success: true,
            source: "live",
            data: body,
          };

          redis
            .setex(key, ttl, JSON.stringify(cachePayload))
            .catch((err: unknown) => console.error("Redis cache error:", err));
        }

        return res._originalJson!(body);
      };

      next();
    } catch (err) {
      // 🚨 fail-safe: never block request if cache breaks
      console.error("Cache middleware error:", err);
      next();
    }
  };
};

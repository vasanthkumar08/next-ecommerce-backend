import redis from "../config/redis.js";

/* ===================== TYPES ===================== */

type CacheValue<T> = T | null;

/* ===================== GET CACHE ===================== */
export const getCache = async <T>(key: string): Promise<CacheValue<T>> => {
  try {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (err: any) {
    console.error("Redis GET error:", err.message);
    return null;
  }
};

/* ===================== SET CACHE ===================== */
export const setCache = async <T>(
  key: string,
  value: T,
  ttl: number = 300
): Promise<void> => {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (err: any) {
    console.error("Redis SET error:", err.message);
  }
};

/* ===================== DELETE CACHE ===================== */
export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (err: any) {
    console.error("Redis DELETE error:", err.message);
  }
};
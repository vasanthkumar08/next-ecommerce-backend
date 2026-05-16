import { Redis } from "ioredis";
import env from "./env.js";

declare global {
  // 👇 Extend global type safely
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

let redis: Redis;

if (!global._redis) {
  if (!env.REDIS_URL) {
    throw new Error("❌ Missing env variable: REDIS_URL");
  }

  global._redis = new Redis(env.REDIS_URL, {
    connectTimeout: 10_000,
    enableOfflineQueue: true,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      return Math.min(times * 250, 5_000);
    },
    reconnectOnError(error) {
      return error.message.includes("READONLY") ? 2 : false;
    },
  });

  global._redis.on("connect", () => {
    console.log(`⚡ Redis Connected (${process.pid})`);
  });

  global._redis.on("ready", () => {
    console.log("✅ Redis ready");
  });

  global._redis.on("error", (err: Error) => {
    console.error("❌ Redis Error:", err.message); 
  });

  global._redis.on("reconnecting", () => {
    console.warn("🔄 Redis reconnecting");
  });
}

redis = global._redis;

export default redis;

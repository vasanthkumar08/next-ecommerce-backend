import Redis from "ioredis";

declare global {
  // 👇 Extend global type safely
  // eslint-disable-next-line no-var
  var _redis: Redis | undefined;
}

let redis: Redis;

if (!global._redis) {
  global._redis = new Redis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  global._redis.on("connect", () => {
    console.log(`⚡ Redis Connected (${process.pid})`);
  });

  global._redis.on("error", (err: Error) => {
    console.error("❌ Redis Error:", err.message);
  });
}

redis = global._redis;

export default redis;
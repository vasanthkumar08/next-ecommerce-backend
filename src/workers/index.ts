import "../config/env.js";
import "../config/redis.js";

import "./email.worker.js";
import "./order.worker.js";

/**
 * 👷 Worker bootstrap
 */
console.log(`👷 Workers started (${process.pid})`);

/**
 * 🔇 Suppress noisy Redis warnings (clean production logs)
 */
const originalWarn = console.warn;

console.warn = (...args: any[]) => {
  const message = args[0];

  if (
    typeof message === "string" &&
    message.includes("Eviction policy")
  ) {
    return;
  }

  originalWarn(...args);
};
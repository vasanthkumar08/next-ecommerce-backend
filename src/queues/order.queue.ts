import { Queue } from "bullmq";
import redis from "../config/redis";

/**
 * 📦 Order Queue
 */
export const orderQueue = new Queue("orderQueue", {
  connection: redis,
});
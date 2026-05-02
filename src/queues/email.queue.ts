import { Queue } from "bullmq";
import redis from "../config/redis";

/**
 * 📧 Email Job Type
 */
export interface EmailJobData {
  to: string;
  subject: string;
  template?: string;
  payload?: Record<string, unknown>;
  text?: string;
  html?: string;
}

/**
 * 📧 Email Queue
 */
export const emailQueue = new Queue<EmailJobData>("emailQueue", {
  connection: redis,

  defaultJobOptions: {
    attempts: 3, // 🔁 retry 3 times
    backoff: {
      type: "exponential",
      delay: 5000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
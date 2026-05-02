import { Worker, Job } from "bullmq";
import redis from "../config/redis";

/**
 * 📦 Email Job Data
 */
interface EmailJobData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * 👷 Email Worker
 */
const worker = new Worker<EmailJobData>(
  "emailQueue",
  async (job: Job<EmailJobData>) => {
    // your logic here
    console.log("📧 Sending email to:", job.data.to);
  },
  {
    connection: redis.duplicate(), // 🔥 required for BullMQ concurrency safety
    concurrency: 5,
  }
);

/**
 * ❌ Error handling (filtered logs)
 */
worker.on("error", (err: Error) => {
  if (!err.message.includes("Eviction policy")) {
    console.error("❌ Worker error:", err.message);
  }
});

export default worker;
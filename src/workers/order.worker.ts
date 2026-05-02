import { Worker, Job } from "bullmq";
import redis from "../config/redis";
import { emailQueue } from "../queues/email.queue";

/**
 * 📦 Order Job Data Type
 */
interface OrderJobData {
  _id: string;
  userEmail: string;
  userId?: string;
  items?: any[];
  total?: number;
}

/**
 * 📦 Worker Response Type
 */
interface WorkerResult {
  status: "processed" | "failed";
}

/**
 * 📦 Order Worker
 */
export const orderWorker = new Worker<OrderJobData, WorkerResult>(
  "orderQueue",
  async (job: Job<OrderJobData>): Promise<WorkerResult> => {
    const order = job.data;

    console.log("📦 Processing order:", order._id);

    // Example: trigger email after order
    await emailQueue.add("order-confirmation", {
      to: order.userEmail,
      subject: "Order Confirmed 🎉",
      text: `Your order ${order._id} is confirmed!`,
    });

    return { status: "processed" };
  },
  {
    connection: redis,
  }
);
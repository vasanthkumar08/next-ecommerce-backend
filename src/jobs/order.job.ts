import { JobsOptions } from "bullmq";
import { orderQueue } from "../queues/order.queue";

/**
 * 📦 Order Item Type
 */
interface OrderItem {
  product: string; // ObjectId as string
  quantity: number;
  price: number;
}

/**
 * 📦 Order Type (input from DB)
 */
interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  total: number;
}

/**
 * 📦 Queue Payload Type
 */
interface OrderJobData {
  orderId: string;
  userId: string;
  items: OrderItem[];
  total: number;
}

/**
 * 📦 Order Processing Job
 */
export const addOrderJob = async (order: Order): Promise<void> => {
  const jobOptions: JobsOptions = {
    attempts: 3,
  };

  const payload: OrderJobData = {
    orderId: order._id,
    userId: order.user,
    items: order.items,
    total: order.total,
  };

  await orderQueue.add("process-order", payload, jobOptions);
};
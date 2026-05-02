import Product from "./product.model.js";
import { ClientSession, Types } from "mongoose";

interface OrderItem {
  product: Types.ObjectId | string;
  quantity: number;
}

export const validateStock = async (
  items: OrderItem[],
  session: ClientSession
): Promise<void> => {
  for (const item of items) {
    const product = await Product.findById(item.product).session(session);
    if (!product) throw new Error(`Product not found: ${item.product}`);
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }
};

export const reserveStock = async (
  items: OrderItem[],
  session: ClientSession
): Promise<void> => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: -item.quantity, reservedStock: item.quantity } },
      { session }
    );
  }
};

export const confirmStock = async (
  items: OrderItem[],
  session: ClientSession
): Promise<void> => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { reservedStock: -item.quantity } },
      { session }
    );
  }
};

export const releaseStock = async (
  items: OrderItem[],
  session: ClientSession
): Promise<void> => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.quantity, reservedStock: -item.quantity } },
      { session }
    );
  }
};
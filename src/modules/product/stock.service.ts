import Product from "./product.model.js";
import { ClientSession, Types } from "mongoose";
import AppError from "../../utils/AppError.js";

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
    const result = await Product.updateOne(
      {
        _id: item.product,
        stock: { $gte: item.quantity },
      },
      { $inc: { stock: -item.quantity, reservedStock: item.quantity } },
      { session }
    );

    if (result.matchedCount !== 1) {
      throw new AppError(`Insufficient stock for product ${item.product}`, 409);
    }
  }
};

export const confirmStock = async (
  items: OrderItem[],
  session: ClientSession
): Promise<void> => {
  for (const item of items) {
    const result = await Product.updateOne(
      {
        _id: item.product,
        reservedStock: { $gte: item.quantity },
      },
      { $inc: { reservedStock: -item.quantity } },
      { session }
    );

    if (result.matchedCount !== 1) {
      throw new AppError(`Reserved stock mismatch for product ${item.product}`, 409);
    }
  }
};

export const releaseStock = async (
  items: OrderItem[],
  session: ClientSession
): Promise<void> => {
  for (const item of items) {
    const result = await Product.updateOne(
      {
        _id: item.product,
        reservedStock: { $gte: item.quantity },
      },
      { $inc: { stock: item.quantity, reservedStock: -item.quantity } },
      { session }
    );

    if (result.matchedCount !== 1) {
      throw new AppError(`Reserved stock mismatch for product ${item.product}`, 409);
    }
  }
};

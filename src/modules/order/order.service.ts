import mongoose from "mongoose";

import Order from "./order.model";
import Cart from "../cart/cart.model";
import AppError from "../../utils/AppError";
import type { IProduct } from "../product/product.model";

import { validateStock, reserveStock, confirmStock, releaseStock } from "../product/stock.service";

interface CheckoutOrderItem {
  product?: string;
  productId: string | number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  address: string;
  city: string;
  pincode: string;
  country: string;
}

type PaymentMethod = "cod" | "credit_card" | "debit_card" | "upi";

const stockManagedItems = (
  items: Array<{ product?: mongoose.Types.ObjectId; quantity: number }>
) =>
  items
    .filter(
      (item): item is { product: mongoose.Types.ObjectId; quantity: number } =>
        Boolean(item.product)
    )
    .map((item) => ({ product: item.product, quantity: item.quantity }));

/* ===================== CREATE ORDER (ATOMIC SAFE) ===================== */

export const createOrder = async (
  userId: string,
  shippingAddress: ShippingAddress,
  paymentMethod: PaymentMethod,
  checkoutItems?: CheckoutOrderItem[]
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (checkoutItems?.length) {
      const items = checkoutItems.map((item) => ({
        product: mongoose.Types.ObjectId.isValid(item.product ?? "")
          ? item.product
          : undefined,
        productId: String(item.productId),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image ?? "",
      }));

      const itemsPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const taxPrice = Math.round(itemsPrice * 0.1);
      const shippingPrice = itemsPrice > 1000 ? 0 : 50;
      const totalAmount = itemsPrice + taxPrice + shippingPrice;

      const [order] = await Order.create(
        [
          {
            user: userId,
            items,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalAmount,
            shippingAddress,
            status: paymentMethod === "cod" ? "confirmed" : "pending",
            paymentInfo: {
              provider: paymentMethod === "upi" ? "razorpay" : paymentMethod,
              status: paymentMethod === "cod" ? "success" : "pending",
              method: paymentMethod,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return order;
    }

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    /* ===================== STEP 1: VALIDATE STOCK ===================== */
    await validateStock(cart.items, session);

    /* ===================== STEP 2: RESERVE STOCK ===================== */
    await reserveStock(cart.items, session);

    const items = [];
    let itemsPrice = 0;

    for (const item of cart.items) {
      const product = item.product as unknown as IProduct;

      items.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0]?.url || "",
      });

      itemsPrice += product.price * item.quantity;
    }

    const taxPrice = Math.round(itemsPrice * 0.1);
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const totalAmount = itemsPrice + taxPrice + shippingPrice;

    /* ===================== CREATE ORDER ===================== */
    const order = await Order.create(
      [
        {
          user: userId,
          items,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalAmount,
          shippingAddress,
          paymentInfo: {
            provider: paymentMethod === "upi" ? "razorpay" : paymentMethod,
            status: paymentMethod === "cod" ? "success" : "pending",
            method: paymentMethod,
          },
          status: "pending",
        },
      ],
      { session }
    );

    /* ===================== CLEAR CART ===================== */
    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ===================== CONFIRM PAYMENT ===================== */

export const confirmOrderPayment = async (orderId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) throw new AppError("Order not found", 404);

    if (order.status === "paid") return order;

    /* ===================== FINAL STOCK CONFIRM ===================== */
    await confirmStock(stockManagedItems(order.items), session);

    order.status = "paid";
    order.paidAt = new Date();

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return order;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ===================== CANCEL ORDER ===================== */

export const cancelOrder = async (orderId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);

    if (!order) throw new AppError("Order not found", 404);

    if (order.isDelivered) {
      throw new AppError("Order already delivered", 400);
    }

    /* ===================== RELEASE STOCK ===================== */
    await releaseStock(stockManagedItems(order.items), session);

    await order.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    return { id: orderId };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ===================== GET MY ORDERS ===================== */
export const getMyOrders = async (userId: string) => {
  return Order.find({ user: userId }).sort({ createdAt: -1 });
};

/* ===================== GET ORDER BY ID ===================== */
export const getOrderById = async (
  orderId: string,
  user: { _id: string; role: "user" | "admin" | "manager" }
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (user.role !== "admin" && order.user.toString() !== user._id) {
    throw new AppError("Not authorized to view this order", 403);
  }

  return order;
};

/* ===================== UPDATE ORDER STATUS ===================== */
export const updateOrderStatus = async (orderId: string, status: string) => {
  const allowedStatuses = [
    "pending",
    "confirmed",
    "paid",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid order status", 400);
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  order.status = status as typeof order.status;

  if (status === "shipped") {
    order.shippedAt = new Date();
  }
  if (status === "delivered") {
    order.deliveredAt = new Date();
  }
  if (status === "cancelled") {
    order.cancelledAt = new Date();
  }

  await order.save();
  return order;
};

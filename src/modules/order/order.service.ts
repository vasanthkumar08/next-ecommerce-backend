import mongoose from "mongoose";

import Order from "./order.model.js";
import Cart from "../cart/cart.model.js";
import AppError from "../../utils/AppError.js";
import Product from "../product/product.model.js";
import type { IProduct } from "../product/product.model.js";

import { validateStock, reserveStock, confirmStock, releaseStock } from "../product/stock.service.js";

interface CheckoutOrderItem {
  product?: string;
  productId: string | number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface ShippingAddress {
  name?: string;
  address: string;
  phone?: string;
  alternatePhone?: string;
  houseNumber?: string;
  apartment?: string;
  street?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  country: string;
  addressType?: "Home" | "Work" | "Office" | "Other";
}

type PaymentMethod = "cod" | "credit_card" | "debit_card" | "upi";
type OrderActorRole = "user" | "admin" | "moderator" | "manager";

interface ConfirmPaymentInput {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  method?: string;
}

interface CreateOrderOptions {
  idempotencyKey?: string;
}

const stockManagedItems = (
  items: Array<{ product?: mongoose.Types.ObjectId; quantity: number }>
) =>
  items
    .filter(
      (item): item is { product: mongoose.Types.ObjectId; quantity: number } =>
        Boolean(item.product)
    )
    .map((item) => ({ product: item.product, quantity: item.quantity }));

const reservationTtlMs = 15 * 60 * 1000;

const reservationExpiresAt = () => new Date(Date.now() + reservationTtlMs);

/* ===================== CREATE ORDER (ATOMIC SAFE) ===================== */

export const createOrder = async (
  userId: string,
  shippingAddress: ShippingAddress,
  paymentMethod: PaymentMethod,
  checkoutItems?: CheckoutOrderItem[],
  options: CreateOrderOptions = {}
) => {
  const idempotencyKey = options.idempotencyKey?.trim();
  if (idempotencyKey) {
    const existing = await Order.findOne({ user: userId, idempotencyKey });
    if (existing) return existing;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (checkoutItems?.length) {
      const itemQuantities = new Map<string, number>();

      for (const item of checkoutItems) {
        const productId = String(item.product ?? item.productId);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
          throw new AppError("Invalid product in checkout", 400);
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new AppError("Invalid checkout quantity", 400);
        }

        itemQuantities.set(
          productId,
          (itemQuantities.get(productId) ?? 0) + item.quantity
        );
      }

      const productIds = [...itemQuantities.keys()];
      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true,
      }).session(session);

      if (products.length !== productIds.length) {
        throw new AppError("One or more checkout products are unavailable", 400);
      }

      const productsById = new Map(
        products.map((product) => [String(product._id), product])
      );

      const stockItems = productIds.map((productId) => ({
        product: new mongoose.Types.ObjectId(productId),
        quantity: itemQuantities.get(productId) ?? 0,
      }));

      await validateStock(stockItems, session);
      await reserveStock(stockItems, session);
      const isCod = paymentMethod === "cod";

      if (isCod) {
        await confirmStock(stockItems, session);
      }

      const items = productIds.map((productId) => {
        const product = productsById.get(productId);

        if (!product) {
          throw new AppError("Product unavailable during checkout", 400);
        }

        return {
          product: product._id,
          productId,
          name: product.name,
          quantity: itemQuantities.get(productId) ?? 0,
          price: product.price,
          image: product.images?.[0]?.url || "",
        };
      });

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
            idempotencyKey,
            stockReservationExpiresAt: isCod ? undefined : reservationExpiresAt(),
            shippingAddress,
            status: isCod ? "confirmed" : "pending",
            paymentInfo: {
              provider: paymentMethod === "upi" ? "razorpay" : paymentMethod,
              status: isCod ? "success" : "pending",
              method: paymentMethod,
            },
          },
        ],
        { session }
      );

      await Cart.updateOne({ user: userId }, { $set: { items: [] } }, { session });

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
    const isCod = paymentMethod === "cod";

    if (isCod) {
      await confirmStock(cart.items, session);
    }

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
          idempotencyKey,
          stockReservationExpiresAt: isCod ? undefined : reservationExpiresAt(),
          shippingAddress,
          paymentInfo: {
            provider: paymentMethod === "upi" ? "razorpay" : paymentMethod,
            status: isCod ? "success" : "pending",
            method: paymentMethod,
          },
          status: isCod ? "confirmed" : "pending",
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
    if (
      idempotencyKey &&
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      const existing = await Order.findOne({ user: userId, idempotencyKey });
      if (existing) return existing;
    }
    throw err;
  }
};

/* ===================== CONFIRM PAYMENT ===================== */

export const confirmOrderPayment = async (
  orderId: string,
  payment?: ConfirmPaymentInput
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        isPaid: false,
        status: { $in: ["pending", "confirmed"] },
        "paymentInfo.status": { $ne: "success" },
      },
      {
        $set: {
          status: "processing",
          "paymentInfo.razorpayOrderId": payment?.razorpayOrderId,
          "paymentInfo.razorpayPaymentId": payment?.razorpayPaymentId,
          "paymentInfo.method": payment?.method ?? "razorpay",
        },
      },
      { new: true, session }
    );

    if (!order) {
      const existing = await Order.findById(orderId).session(session);
      if (!existing) throw new AppError("Order not found", 404);
      if (existing.status === "paid" || existing.isPaid) {
      await session.commitTransaction();
      session.endSession();
        return existing;
      }

      throw new AppError("Order is not payable in its current state", 409);
    }

    /* ===================== FINAL STOCK CONFIRM ===================== */
    await confirmStock(stockManagedItems(order.items), session);

    order.status = "paid";
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentInfo = {
      ...order.paymentInfo,
      provider: "razorpay",
      razorpayOrderId:
        payment?.razorpayOrderId ?? order.paymentInfo.razorpayOrderId,
      razorpayPaymentId:
        payment?.razorpayPaymentId ?? order.paymentInfo.razorpayPaymentId,
      status: "success",
      method: payment?.method ?? order.paymentInfo.method ?? "razorpay",
    };
    order.stockReservationExpiresAt = undefined;

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
    const order = await Order.findOneAndUpdate(
      {
        _id: orderId,
        isDelivered: false,
        status: { $nin: ["cancelled", "refunded", "processing"] },
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
        },
      },
      { new: true, session }
    );

    if (!order) {
      const existing = await Order.findById(orderId).session(session);
      if (!existing) throw new AppError("Order not found", 404);

      if (existing.isDelivered) {
      throw new AppError("Order already delivered", 400);
    }

      if (existing.status === "cancelled" || existing.status === "refunded") {
      await session.commitTransaction();
      session.endSession();
      return { id: orderId };
    }

      throw new AppError("Order is currently being processed", 409);
    }

    if (!order.isPaid) {
      await releaseStock(stockManagedItems(order.items), session);
    }

    order.status = order.isPaid ? "refunded" : "cancelled";
    order.paymentInfo.status = order.isPaid ? "success" : "failed";
    order.stockReservationExpiresAt = undefined;

    await order.save({ session });

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
  user: { _id: string; role: OrderActorRole }
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (
    user.role !== "admin" &&
    user.role !== "manager" &&
    user.role !== "moderator" &&
    order.user.toString() !== user._id
  ) {
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

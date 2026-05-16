import Razorpay from "razorpay";
import crypto from "crypto";

import Order from "../order/order.model.js";
import Payment from "./payment.model.js";
import { confirmOrderPayment } from "../order/order.service.js";

import AppError from "../../utils/AppError.js";
import env from "../../config/env.js";

/* ===================== TYPES ===================== */

interface VerifyPaymentData {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

/* ===================== SAFETY CHECK ===================== */

if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
  throw new Error("❌ Razorpay keys missing in .env file");
}

/* ===================== INIT RAZORPAY ===================== */

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/* ===================== CREATE ORDER ===================== */

export const createRazorpayOrder = async (
  orderId: string,
  userId: string
) => {
  const order = await Order.findById(orderId);

  if (!order) throw new AppError("Order not found", 404);

  if (order.user.toString() !== userId.toString()) {
    throw new AppError("Not authorized", 403);
  }

  // 🔥 prevent duplicate payments
  if (order.status === "paid") {
    throw new AppError("Order already paid", 400);
  }

  if (order.status !== "pending" && order.status !== "confirmed") {
    throw new AppError("Order is not payable in its current state", 409);
  }

  const existingPayment = await Payment.findOne({ order: orderId });
  if (existingPayment?.razorpayOrderId) {
    return {
      id: existingPayment.razorpayOrderId,
      amount: Math.round(existingPayment.amount * 100),
      currency: existingPayment.currency,
      receipt: order._id.toString(),
    };
  }

  if (existingPayment?.status === "creating") {
    throw new AppError("Payment creation already in progress", 409);
  }

  if (existingPayment?.status === "failed" && !existingPayment.razorpayOrderId) {
    const lock = await Payment.updateOne(
      { _id: existingPayment._id, status: "failed" },
      {
        status: "creating",
        amount: order.totalAmount,
        currency: order.currency,
        error: undefined,
      }
    );

    if (lock.modifiedCount !== 1) {
      throw new AppError("Payment creation already in progress", 409);
    }
  } else if (!existingPayment) {
    try {
      await Payment.create({
        user: userId,
        order: orderId,
        amount: order.totalAmount,
        currency: order.currency,
        status: "creating",
      });
    } catch (error) {
      const duplicatePayment =
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: number }).code === 11000;

      if (!duplicatePayment) throw error;

      const payment = await Payment.findOne({ order: orderId });
      if (payment?.razorpayOrderId) {
        return {
          id: payment.razorpayOrderId,
          amount: Math.round(payment.amount * 100),
          currency: payment.currency,
          receipt: order._id.toString(),
        };
      }

      throw new AppError("Payment creation already in progress", 409);
    }
  } else {
    throw new AppError("Payment record is not retryable", 409);
  }

  const options = {
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order._id.toString(),
    payment_capture: 1,
  };

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create(options);
  } catch (error) {
    await Payment.findOneAndUpdate(
      { order: orderId, status: "creating" },
      {
        status: "failed",
        error: {
          code: "razorpay_order_create_failed",
          description:
            error instanceof Error ? error.message : "Razorpay order creation failed",
        },
      }
    );
    throw error;
  }

  // 💳 create or update payment record (idempotent safe)
  await Payment.findOneAndUpdate(
    { order: orderId },
    {
      user: userId,
      order: orderId,
      amount: order.totalAmount,
      currency: order.currency,
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    },
    { upsert: true, new: true }
  );

  order.paymentInfo = {
    ...order.paymentInfo,
    provider: "razorpay",
    razorpayOrderId: razorpayOrder.id,
    status: "pending",
    method: order.paymentInfo.method ?? "razorpay",
  };
  await order.save();

  return razorpayOrder;
};

/* ===================== VERIFY PAYMENT ===================== */

export const verifyPayment = async (
  data: VerifyPaymentData,
  userId: string
) => {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = data;

  const order = await Order.findById(orderId);

  if (!order) throw new AppError("Order not found", 404);

  if (order.user.toString() !== userId.toString()) {
    throw new AppError("Not authorized", 403);
  }

  // 🔥 idempotency protection
  if (order.status === "paid" || order.isPaid) {
    return { message: "Already verified" };
  }

  if (
    order.paymentInfo.razorpayOrderId &&
    order.paymentInfo.razorpayOrderId !== razorpay_order_id
  ) {
    throw new AppError("Payment order does not match checkout order", 400);
  }

  /* ===================== SIGNATURE CHECK ===================== */

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const secret = env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new AppError("Razorpay secret missing", 500);
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (!safeEqual(expectedSignature, razorpay_signature)) {
    throw new AppError("Invalid payment signature", 400);
  }

  /* ===================== UPDATE PAYMENT ===================== */

  const payment = await Payment.findOneAndUpdate(
    {
      order: orderId,
      razorpayOrderId: razorpay_order_id,
      amount: order.totalAmount,
    },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: "success",
    },
    { new: true }
  );

  if (!payment) {
    throw new AppError("Payment record not found", 404);
  }

  const confirmedOrder = await confirmOrderPayment(orderId, {
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    method: "razorpay",
  });

  return {
    order: confirmedOrder,
    payment,
    message: "Payment verified successfully",
  };
};

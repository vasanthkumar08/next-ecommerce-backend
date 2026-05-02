import Razorpay from "razorpay";
import crypto from "crypto";

import Order from "../order/order.model.js";
import Payment from "./payment.model.js";

import AppError from "../../utils/AppError.js";
import env from "../../config/env.js";

/* ===================== TYPES ===================== */

interface VerifyPaymentData {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

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

  const options = {
    amount: Math.round(order.totalAmount * 100),
    currency: "INR",
    receipt: order._id.toString(),
    payment_capture: 1,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  // 💳 create or update payment record (idempotent safe)
  await Payment.findOneAndUpdate(
    { order: orderId },
    {
      user: userId,
      order: orderId,
      amount: order.totalAmount,
      razorpayOrderId: razorpayOrder.id,
      status: "created",
    },
    { upsert: true, new: true }
  );

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
  if (order.status === "paid") {
    return { message: "Already verified" };
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

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Invalid payment signature", 400);
  }

  /* ===================== UPDATE PAYMENT ===================== */

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
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

  /* ===================== UPDATE ORDER ===================== */

  order.status = "paid";
  order.paymentInfo = {
    provider: "razorpay",
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    status: "success",
    method: "razorpay",
  };

  order.paidAt = new Date();

  await order.save();

  return {
    order,
    payment,
    message: "Payment verified successfully",
  };
};
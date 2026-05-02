import { Request, Response, NextFunction } from "express";
import * as paymentService from "./payment.service";
import Order from "../order/order.model";
import AppError from "../../utils/AppError";

/* ===================== CREATE ORDER ===================== */

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId } = req.body as { orderId: string };

    if (!orderId) {
      throw new AppError("Order ID is required", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (!req.user?._id) {
      throw new AppError("Unauthorized", 401);
    }

    if (order.user.toString() !== req.user._id) {
      throw new AppError("Not authorized for this order", 403);
    }

    if (order.status === "paid") {
      throw new AppError("Order already paid", 400);
    }

    const razorpayOrder = await paymentService.createRazorpayOrder(
      orderId,
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Razorpay order created",
      data: razorpayOrder,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================== VERIFY PAYMENT ===================== */

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      throw new AppError("Missing payment data", 400);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (!req.user?._id) {
      throw new AppError("Unauthorized", 401);
    }

    if (order.user.toString() !== req.user._id) {
      throw new AppError("Not authorized", 403);
    }

    if (order.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        data: order,
      });
    }

    const verifiedOrder = await paymentService.verifyPayment(
      {
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      req.user._id
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: verifiedOrder,
    });
  } catch (err) {
    next(err);
  }
};

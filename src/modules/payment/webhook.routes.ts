import express, { Request, Response, Router } from "express";
import crypto from "crypto";

import Order from "../order/order.model.js";
import Payment from "./payment.model.js";
import env from "../../config/env.js";
import { confirmOrderPayment } from "../order/order.service.js";

/* ===================== ROUTER ===================== */

const router: Router = express.Router();

/* ===================== TYPES ===================== */

interface RazorpayPayment {
  id: string;
  order_id: string;
  status: string;
  amount?: number;
  error_code?: string;
  error_description?: string;
}

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: RazorpayPayment;
    };
  };
}

/* ===================== WEBHOOK ===================== */

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req: Request & { rawBody?: Buffer }, res: Response) => {
    try {
      const secret = env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(500).json({ message: "Webhook secret missing" });
      }

      const signature = req.headers["x-razorpay-signature"] as string;

      const body = Buffer.isBuffer(req.body)
        ? req.body
        : req.rawBody ?? Buffer.from(JSON.stringify(req.body));

      /* ===================== VERIFY SIGNATURE ===================== */

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      const signatureMatches =
        typeof signature === "string" &&
        Buffer.from(signature).length === Buffer.from(expectedSignature).length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

      if (!signatureMatches) {
        return res.status(400).json({ message: "Invalid signature" });
      }

      const parsed: RazorpayWebhookPayload = JSON.parse(
        body.toString()
      );

      const { event, payload } = parsed;

      /* ===================== PAYMENT SUCCESS ===================== */

      if (event === "payment.captured") {
        const payment = payload.payment.entity;

        const razorpayOrderId = payment.order_id;

        // 🔥 find order safely
        const order = await Order.findOne({
          "paymentInfo.razorpayOrderId": razorpayOrderId,
        });

        if (!order) {
          return res.status(404).json({ message: "Order not found" });
        }

        // 🔥 idempotency check
        if (order.status === "paid") {
          return res.json({
            success: true,
            message: "Already processed",
          });
        }

        const storedPayment = await Payment.findOneAndUpdate(
          {
            order: order._id,
            razorpayOrderId,
          },
          {
            razorpayPaymentId: payment.id,
            status: "success",
          },
          { new: true }
        );

        if (!storedPayment) {
          return res.status(409).json({ message: "Payment record not found" });
        }

        if (
          typeof payment.amount === "number" &&
          payment.amount !== Math.round(order.totalAmount * 100)
        ) {
          await Payment.findByIdAndUpdate(storedPayment._id, {
            status: "failed",
            error: {
              code: "amount_mismatch",
              description: "Captured payment amount does not match order total",
            },
          });
          return res.status(409).json({ message: "Payment amount mismatch" });
        }

        await confirmOrderPayment(order._id.toString(), {
          razorpayOrderId,
          razorpayPaymentId: payment.id,
          method: "razorpay",
        });
      }

      if (event === "payment.failed") {
        const payment = payload.payment.entity;

        await Payment.findOneAndUpdate(
          { razorpayOrderId: payment.order_id },
          {
            razorpayPaymentId: payment.id,
            status: "failed",
            error: {
              code: payment.error_code,
              description: payment.error_description,
            },
          }
        );
      }

      return res.json({ success: true });
    } catch (err) {
      console.error("Webhook Error:", err);
      return res.status(500).json({ message: "Webhook error" });
    }
  }
);

export default router;

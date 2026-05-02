import express, { Request, Response, Router } from "express";
import crypto from "crypto";

import Order from "../order/order.model";
import Payment from "./payment.model";
import env from "../../config/env";

/* ===================== ROUTER ===================== */

const router: Router = express.Router();

/* ===================== TYPES ===================== */

interface RazorpayPayment {
  id: string;
  order_id: string;
  status: string;
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
  express.raw({ type: "application/json" }), // 🔥 REQUIRED FOR SIGNATURE
  async (req: Request, res: Response) => {
    try {
      const secret = env.RAZORPAY_WEBHOOK_SECRET;
      if (!secret) {
        return res.status(500).json({ message: "Webhook secret missing" });
      }

      const signature = req.headers["x-razorpay-signature"] as string;

      const body = req.body as Buffer;

      /* ===================== VERIFY SIGNATURE ===================== */

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

      if (signature !== expectedSignature) {
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

        /* ===================== UPDATE ORDER ===================== */

        order.status = "paid";
        order.paymentInfo.razorpayPaymentId = payment.id;
        order.paymentInfo.status = "success";
        order.paidAt = new Date();

        await order.save();

        /* ===================== UPDATE PAYMENT ===================== */

        await Payment.findOneAndUpdate(
          { razorpayOrderId },
          {
            razorpayPaymentId: payment.id,
            status: "success",
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
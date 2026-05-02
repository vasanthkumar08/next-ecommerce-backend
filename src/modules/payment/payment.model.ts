import mongoose, { Schema, Document, Model } from "mongoose";

/* ===================== TYPES ===================== */

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;

  provider: "razorpay";

  amount: number;
  currency: string;

  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  status: "created" | "success" | "failed" | "refunded";

  method?: string;

  error?: {
    code?: string;
    description?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

/* ===================== SCHEMA ===================== */

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["razorpay"],
      default: "razorpay",
    },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },

    razorpayOrderId: {
      type: String,
      // ❌ removed index here (duplicate)
    },

    razorpayPaymentId: {
      type: String,
    },

    razorpaySignature: String,

    status: {
      type: String,
      enum: ["created", "success", "failed", "refunded"],
      default: "created",
      index: true, // ✅ keep this
    },

    method: String,

    error: {
      code: String,
      description: String,
    },
  },
  {
    timestamps: true,
  }
);

/* ===================== INDEXES ===================== */

// ✅ unique constraint handled here only
paymentSchema.index(
  { razorpayOrderId: 1 },
  { unique: true, sparse: true }
);

// ✅ fast lookup
paymentSchema.index({ user: 1, createdAt: -1 });

/* ===================== MODEL ===================== */

const Payment: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  paymentSchema
);

export default Payment;  
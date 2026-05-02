import mongoose, { Schema, Document, Model } from "mongoose";

/* ===================== TYPES ===================== */

export interface IOrderItem {
  product?: mongoose.Types.ObjectId;
  productId?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  orderItems?: IOrderItem[];

  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalAmount: number;
  totalPrice?: number;

  currency: string;

  status:
    | "pending"
    | "confirmed"
    | "paid"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "cancelled"
    | "refunded";

  paymentInfo: {
    provider: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status: "pending" | "success" | "failed";
    method?: string;
  };

  shippingAddress: {
    address: string;
    city?: string;
    pincode?: string;
    country?: string;
  };

  paidAt?: Date;
  isPaid: boolean;
  isDelivered: boolean;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/* ===================== ITEM SCHEMA ===================== */

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      index: true, // ✅ OK (simple index)
    },
    productId: { type: String },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "" },
  },
  { _id: false }
);

/* ===================== ORDER SCHEMA ===================== */

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: { type: [orderItemSchema], required: true },
    orderItems: { type: [orderItemSchema], default: undefined },

    itemsPrice: { type: Number, required: true, min: 0 },
    taxPrice: { type: Number, default: 0, min: 0 },
    shippingPrice: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, min: 0 },

    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "paid",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      // ❌ removed index: true (duplicate)
    },

    paymentInfo: {
      provider: { type: String, default: "razorpay" },

      razorpayOrderId: {
        type: String,
        // ❌ removed index here (handled below if needed)
      },

      razorpayPaymentId: {
        type: String,
      },

      status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
      },

      method: String,
    },

    shippingAddress: {
      address: { type: String, required: true },
      city: String,
      pincode: String,
      country: String,
    },

    paidAt: Date,
    isPaid: { type: Boolean, default: false, index: true },
    isDelivered: { type: Boolean, default: false, index: true },
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.pre<IOrder>("save", function () {
  if (!this.orderItems || this.orderItems.length === 0) {
    this.orderItems = this.items;
  }

  if (!this.totalPrice) {
    this.totalPrice = this.totalAmount;
  }

  if (this.status === "paid" || this.status === "delivered" || this.status === "completed") {
    this.isPaid = true;
  }

  if (this.status === "delivered" || this.status === "completed") {
    this.isDelivered = true;
    this.deliveredAt = this.deliveredAt ?? new Date();
  }
});

/* ===================== INDEXES ===================== */

// ✅ compound index (good)
orderSchema.index({ user: 1, createdAt: -1 });

// ✅ single index (kept here only)
orderSchema.index({ status: 1 });

/* ===================== MODEL ===================== */

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export default Order;

import mongoose, { Schema, Document, Types } from "mongoose";

/* ===================== CART ITEM TYPE ===================== */
export interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

/* ===================== CART DOCUMENT ===================== */
export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  totalPrice: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ===================== CART ITEM SCHEMA ===================== */
const cartItemSchema = new Schema<ICartItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    name: String,
    image: String,
  },
  { _id: false }
);

/* ===================== CART SCHEMA ===================== */
const cartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },

    totalItems: {
      type: Number,
      default: 0,
    },

    totalPrice: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===================== MODEL ===================== */
export default mongoose.model<ICart>("Cart", cartSchema);
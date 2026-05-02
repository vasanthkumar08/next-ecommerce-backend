import mongoose, { Schema, Document, Types, Model } from "mongoose";

/* ===================== TYPES ===================== */

export interface IWishlist extends Document {
  user: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

/* ===================== SCHEMA ===================== */

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true, // 🚀 performance improvement
    },

    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

/* ===================== MODEL ===================== */

const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>(
  "Wishlist",
  wishlistSchema
);

export default Wishlist;
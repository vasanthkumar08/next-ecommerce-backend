import mongoose, { Schema, Document, Model, Types } from "mongoose";

/* ===================== TYPES ===================== */

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

/* ===================== SCHEMA ===================== */

const reviewSchema = new Schema<IReview>(
  {
    // 👤 User
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 📦 Product
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // ⭐ Rating
    rating: {
      type: Number,
      required: true,
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer",
      },
      index: true,
    },

    // 💬 Comment
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Comment too short"],
      maxlength: [1000, "Comment too long"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===================== INDEXES ===================== */

// 🔥 One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// ⚡ Fast product review listing
reviewSchema.index({ product: 1, createdAt: -1 });

/* ===================== MODEL ===================== */

const Review: Model<IReview> = mongoose.model<IReview>(
  "Review",
  reviewSchema
);

export default Review;
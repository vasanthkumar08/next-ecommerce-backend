import Review from "./review.model";
import Product from "../product/product.model";
import AppError from "../../utils/AppError";
import { Types } from "mongoose";

/* ===================== TYPES ===================== */

type UserId = string | Types.ObjectId;
type ProductId = string | Types.ObjectId;

interface ReviewInput {
  productId: ProductId;
  rating: number;
  comment?: string;
}

/* ===================== ADD / UPDATE REVIEW ===================== */

export const addReview = async (userId: UserId, data: ReviewInput) => {
  const { productId, rating, comment } = data;

  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  const review = await Review.findOneAndUpdate(
    { user: userId, product: productId },
    {
      rating,
      comment,
      user: userId,
      product: productId,
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  // ⚡ Aggregate rating update
  const stats = await Review.aggregate([
    { $match: { product: new Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  product.ratings = stats[0]?.avgRating || 0;
  product.numReviews = stats[0]?.count || 0;

  await product.save();

  return {
    success: true,
    message: "Review saved successfully",
    data: review,
  };
};

/* ===================== GET REVIEWS ===================== */

export const getReviews = async (productId: ProductId) => {
  const reviews = await Review.find({ product: productId })
    .populate("user", "name avatar")
    .sort("-createdAt");

  return {
    success: true,
    count: reviews.length,
    data: reviews,
  };
};

/* ===================== DELETE REVIEW ===================== */

export const deleteReview = async (
  userId: UserId,
  reviewId: string
) => {
  const review = await Review.findById(reviewId);

  if (!review) throw new AppError("Review not found", 404);

  if (review.user.toString() !== userId.toString()) {
    throw new AppError("Not allowed", 403);
  }

  const productId = review.product;

  await review.deleteOne();

  // ⚡ Recalculate stats
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const product = await Product.findById(productId);
  if (!product) throw new AppError("Product not found", 404);

  product.ratings = stats[0]?.avgRating || 0;
  product.numReviews = stats[0]?.count || 0;

  await product.save();

  return {
    success: true,
    message: "Review deleted successfully",
  };
};
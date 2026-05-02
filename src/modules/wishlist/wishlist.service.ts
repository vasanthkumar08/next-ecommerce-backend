import Wishlist from "./wishlist.model";
import { Types } from "mongoose";

/* ===================== TYPES ===================== */

type UserId = string | Types.ObjectId;
type ProductId = string | Types.ObjectId;

/* ===================== GET WISHLIST ===================== */
export const getWishlist = async (userId: UserId) => {
  return await Wishlist.findOne({ user: userId }).populate("products");
};

/* ===================== ADD TO WISHLIST ===================== */
export const addToWishlist = async (userId: UserId, productId: ProductId) => {
  let wishlist = await Wishlist.findOne({ user: userId });

  // create if not exists
  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId],
    });
    return wishlist;
  }

  // prevent duplicates (safe ObjectId comparison)
  const exists = wishlist.products.some(
    (id: any) => id.toString() === productId.toString()
  );

  if (!exists) {
    wishlist.products.push(productId as any);
    await wishlist.save();
  }

  return wishlist;
};

/* ===================== REMOVE FROM WISHLIST ===================== */
export const removeFromWishlist = async (
  userId: UserId,
  productId: ProductId
) => {
  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) return null;

  wishlist.products = wishlist.products.filter(
    (id: any) => id.toString() !== productId.toString()
  );

  await wishlist.save();

  return wishlist;
};
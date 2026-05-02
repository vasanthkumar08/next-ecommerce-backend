import { Request, Response, NextFunction } from "express";
import * as wishlistService from "./wishlist.service.js";

/* ===================== TYPES ===================== */

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

/* ===================== GET ===================== */
export const getWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await wishlistService.getWishlist(req.user._id);

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/* ===================== ADD ===================== */
export const addToWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const data = await wishlistService.addToWishlist(
      req.user._id,
      req.body.productId
    );

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/* ===================== REMOVE ===================== */
export const removeFromWishlist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const productId =
      typeof req.params.productId === "string"
        ? req.params.productId
        : "";
    const data = await wishlistService.removeFromWishlist(
      req.user._id,
      productId
    );

    return res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
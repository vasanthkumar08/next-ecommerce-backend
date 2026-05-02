import { Request, Response, NextFunction } from "express";
import * as cartService from "./cart.service.js";
import { sendResponse } from "../../utils/response.js";
import AppError from "../../utils/AppError.js";

/* ===================== ADD ITEM ===================== */
export const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      throw new AppError("productId and quantity are required", 400);
    }

    const cart = await cartService.addToCart(
      req.user._id,
      productId,
      quantity
    );

    sendResponse(res, 200, "Item added to cart", cart);
  } catch (err) {
    next(err);
  }
};

/* ===================== GET CART ===================== */
export const getCart = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);
    const cart = await cartService.getCart(req.user._id);

    sendResponse(res, 200, "Cart fetched", cart);
  } catch (err) {
    next(err);
  }
};

/* ===================== UPDATE ITEM ===================== */
export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      throw new AppError("productId and quantity are required", 400);
    }

    const cart = await cartService.updateCartItem(
      req.user._id,
      productId,
      quantity
    );

    sendResponse(res, 200, "Cart updated", cart);
  } catch (err) {
    next(err);
  }
};

/* ===================== REMOVE ITEM ===================== */
export const removeItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);
    const productId =
      typeof req.params.productId === "string"
        ? req.params.productId
        : "";

    if (!productId) {
      throw new AppError("productId is required", 400);
    }

    const cart = await cartService.removeFromCart(
      req.user._id,
      productId
    );

    sendResponse(res, 200, "Item removed from cart", cart);
  } catch (err) {
    next(err);
  }
};

/* ===================== CLEAR CART ===================== */
export const clear = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) throw new AppError("Unauthorized", 401);
    const data = await cartService.clearCart(req.user._id);

    sendResponse(res, 200, "Cart cleared", data);
  } catch (err) {
    next(err);
  }
};
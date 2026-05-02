import express from "express";

import {
  addItem,
  getCart,
  updateItem,
  removeItem,
  clear,
} from "./cart.controller";

import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  addToCartValidator,
  updateCartValidator,
  removeItemValidator,
} from "./cart.validator";

import {
  rateLimitMiddleware,
  cartLimiter,
} from "../../middleware/rateLimiter";

const router = express.Router();

/* ===================== AUTH ===================== */
router.use(protect);

/* ===================== GET CART ===================== */
router.get("/", getCart);

/* ===================== ADD ITEM ===================== */
router.post(
  "/items",
  rateLimitMiddleware(cartLimiter),
  validate({ body: addToCartValidator }),
  addItem
);

/* ===================== UPDATE ITEM ===================== */
router.put(
  "/items",
  rateLimitMiddleware(cartLimiter),
  validate({ body: updateCartValidator }),
  updateItem
);

/* ===================== REMOVE ITEM ===================== */
router.delete(
  "/items/:productId",
  rateLimitMiddleware(cartLimiter),
  validate({ params: removeItemValidator }),
  removeItem
);

/* ===================== CLEAR CART ===================== */
router.delete("/", rateLimitMiddleware(cartLimiter), clear);

export default router;
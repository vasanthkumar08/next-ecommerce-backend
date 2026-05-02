import express, { Router } from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./wishlist.controller";

import { protect } from "../../middleware/auth.middleware";

const router: Router = express.Router();

/* ===================== AUTH MIDDLEWARE ===================== */
router.use(protect);

/* ===================== WISHLIST ROUTES ===================== */

// 📦 Get wishlist
router.get("/", getWishlist);

// ➕ Add to wishlist
router.post("/", addToWishlist);

// ❌ Remove from wishlist
router.delete("/:productId", removeFromWishlist);

export default router;
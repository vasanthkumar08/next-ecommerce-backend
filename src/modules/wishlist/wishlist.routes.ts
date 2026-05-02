import express, { Router } from "express";

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "./wishlist.controller.js";

import { protect } from "../../middleware/auth.middleware.js";

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
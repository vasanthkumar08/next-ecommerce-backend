import express, { Router } from "express";

import {
  add,
  getAll,
  remove,
} from "./review.controller.js";

import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

/* ===================== ROUTER ===================== */

const router: Router = express.Router();

/* ===================== ROUTES ===================== */

/**
 * 📥 Get all reviews for a product
 */
router.get(
  "/:productId",
  // validate(getReviewValidator),
  getAll
);

/**
 * ➕ Create or Update Review
 */
router.post(
  "/",
  protect,
  // validate(addReviewValidator),
  add
);

/**
 * ❌ Delete review
 */
router.delete(
  "/:id",
  protect,
  // validate(deleteReviewValidator),
  remove
);

export default router;

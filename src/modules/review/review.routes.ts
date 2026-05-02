import express, { Router } from "express";

import {
  add,
  getAll,
  remove,
} from "./review.controller";

import { protect } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

/* ===================== ROUTER ===================== */

const router: Router = express.Router();

/* ===================== GLOBAL AUTH ===================== */

router.use(protect);

/* ===================== ROUTES ===================== */

/**
 * ➕ Create or Update Review
 */
router.post(
  "/",
  // validate(addReviewValidator),
  add
);

/**
 * 📥 Get all reviews for a product
 */
router.get(
  "/:productId",
  // validate(getReviewValidator),
  getAll
);

/**
 * ❌ Delete review
 */
router.delete(
  "/:id",
  // validate(deleteReviewValidator),
  remove
);

export default router;
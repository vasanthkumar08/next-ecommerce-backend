import express from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./product.controller";

import { protect, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createProductValidator,
  updateProductValidator,
} from "./product.validator";

import {
  rateLimitMiddleware,
  productLimiter,
} from "../../middleware/rateLimiter";

/* ===================== INIT ===================== */

const router = express.Router();

/* ===================== SHARED MIDDLEWARE ===================== */

const productRateLimit = rateLimitMiddleware(productLimiter);

/* ===================== PUBLIC ROUTES ===================== */

router.get("/", productRateLimit, getAll);

router.get("/:id", productRateLimit, getOne);

/* ===================== ADMIN ROUTES ===================== */

router.post(
  "/",
  productRateLimit,
  protect,
  authorize("admin"),
  validate(createProductValidator),
  create
);

router.put(
  "/:id",
  productRateLimit,
  protect,
  authorize("admin"),
  validate(updateProductValidator),
  update
);

router.delete(
  "/:id",
  productRateLimit,
  protect,
  authorize("admin"),
  remove
);

export default router;
import express from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "./product.controller.js";

import { protect, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import {
  createProductValidator,
  updateProductValidator,
} from "./product.validator.js";

import {
  rateLimitMiddleware,
  productLimiter,
} from "../../middleware/rateLimiter.js";

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
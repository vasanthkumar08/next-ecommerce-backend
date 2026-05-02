import express, { Router, Request, Response, NextFunction } from "express";

import {
  cancel,
  create,
  getMy,
  getOne,
  updateStatus,
} from "./order.controller";

import { protect, authorize } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";

import {
  createOrderValidator,
  updateStatusValidator,
} from "./order.validator";

import {
  orderLimiter,
  rateLimitMiddleware,
} from "../../middleware/rateLimiter";

const router: Router = express.Router();

/* ===================== GLOBAL PROTECTION ===================== */

router.use(protect);

/* ===================== CREATE ORDER ===================== */

router.post(
  "/",
  rateLimitMiddleware(orderLimiter),
  validate(createOrderValidator),
  (req: Request, res: Response, next: NextFunction) => {
    return create(req, res, next);
  }
);

/* ===================== GET MY ORDERS ===================== */

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  return getMy(req, res, next);
});

/* ===================== GET SINGLE ORDER ===================== */

router.get("/:id", (req: Request, res: Response, next: NextFunction) => {
  return getOne(req, res, next);
});

router.delete("/:id", (req: Request, res: Response, next: NextFunction) => {
  return cancel(req, res, next);
});

/* ===================== UPDATE STATUS (ADMIN ONLY) ===================== */

router.put(
  "/:id/status",
  authorize("admin"),
  rateLimitMiddleware(orderLimiter),
  validate(updateStatusValidator),
  (req: Request, res: Response, next: NextFunction) => {
    return updateStatus(req, res, next);
  }
);

export default router;

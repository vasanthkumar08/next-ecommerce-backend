import express, { Router, Request, Response, NextFunction } from "express";

import { createOrder, verify } from "./payment.controller.js";
import { protect } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from "./payment.validator.js";

/* ===================== ROUTER ===================== */

const router: Router = express.Router();

/* ===================== AUTH GATE ===================== */

router.use(protect);

/* ===================== CREATE ORDER ===================== */

router.post(
  "/create",
  validate({ body: createPaymentOrderSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    return createOrder(req, res, next);
  }
);

/* ===================== VERIFY PAYMENT ===================== */

router.post(
  "/verify",
  validate({ body: verifyPaymentSchema }),
  (req: Request, res: Response, next: NextFunction) => {
    return verify(req, res, next);
  }
);

export default router;
import express, { Request, Response } from "express";

import {
  register,
  login,
  refresh,
  logout,
} from "./auth.controller";

import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema } from "./auth.validator";

import {
  rateLimitMiddleware,
  authLimiter,
} from "../../middleware/rateLimiter";

import { protect } from "../../middleware/auth.middleware";

const router = express.Router();

/* ===================== REGISTER ===================== */
router.post(
  "/register",
  validate({ body: registerSchema }),
  register
);

/* ===================== LOGIN ===================== */
router.post(
  "/login",
  rateLimitMiddleware(authLimiter),
  validate({ body: loginSchema }),
  login
);

/* ===================== REFRESH TOKEN ===================== */
router.post(
  "/refresh",
  rateLimitMiddleware(authLimiter),
  refresh
);

/* ===================== LOGOUT ===================== */
router.post(
  "/logout",
  rateLimitMiddleware(authLimiter),
  logout
);

/* ===================== ME ===================== */
router.get("/me", protect, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
});

export default router;

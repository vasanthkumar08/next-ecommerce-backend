import express, { Request, Response } from "express";

import {
  register,
  login,
  refresh,
  logout,
} from "./auth.controller.js";

import { validate } from "../../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.validator.js";

import {
  rateLimitMiddleware,
  authLimiter,
} from "../../middleware/rateLimiter.js";

import { protect } from "../../middleware/auth.middleware.js";

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

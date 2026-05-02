import express, { Router } from "express";

import {
  getMe,
  updateMe,
  changePassword,
} from "./user.controller.js";

import { protect, authorize } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";

import {
  updateProfileSchema,
  changePasswordSchema,
} from "./user.validator.js";

import rateLimit from "express-rate-limit";

/* ===================== ROUTER ===================== */

const router: Router = express.Router();

/* ===================== RATE LIMITER ===================== */

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5, // max attempts
  message: {
    success: false,
    message: "Too many password attempts. Try again later",
  },
});

/* ===================== GLOBAL PROTECTION ===================== */

router.use(protect);

/* ===================== PROFILE ROUTES ===================== */

// 👤 Get current user
router.get("/me", getMe);

// ✏️ Update profile
router.put("/me", validate(updateProfileSchema), updateMe);

/* ===================== SECURITY ROUTES ===================== */

// 🔐 Change password (high security)
router.put(
  "/change-password",
  passwordLimiter,
  validate(changePasswordSchema),
  changePassword
);

export default router;
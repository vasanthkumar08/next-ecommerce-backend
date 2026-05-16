import express, { Request, Response } from "express";

import {
  forgotPassword,
  login,
  logout,
  logoutAll,
  oauthSession,
  refresh,
  register,
  requestEmailVerification,
  resetPassword,
  revokeSession,
  sessions,
  verifyEmail,
} from "./auth.controller.js";

import { validateZod } from "../../middleware/zodValidate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  oauthSessionSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validator.js";

import { protect } from "../../middleware/auth.middleware.js";
import {
  enforceRateLimit,
  loginLimiter,
  passwordResetLimiter,
  refreshLimiter,
  registerLimiter,
} from "../../lib/rate-limit/authRateLimit.js";

const router = express.Router();

router.post(
  "/register",
  enforceRateLimit(registerLimiter),
  validateZod({ body: registerSchema }),
  register
);

router.post(
  "/login",
  enforceRateLimit(loginLimiter),
  validateZod({ body: loginSchema }),
  login
);

router.post(
  "/oauth/session",
  enforceRateLimit(loginLimiter),
  validateZod({ body: oauthSessionSchema }),
  oauthSession
);

router.post("/refresh", enforceRateLimit(refreshLimiter), refresh);
router.post("/logout", enforceRateLimit(refreshLimiter), logout);
router.post("/logout-all", protect, logoutAll);

router.get("/me", protect, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.user,
  });
});

router.get("/sessions", protect, sessions);
router.delete("/sessions/:sessionId", protect, revokeSession);

router.post(
  "/forgot-password",
  enforceRateLimit(passwordResetLimiter),
  validateZod({ body: forgotPasswordSchema }),
  forgotPassword
);

router.post(
  "/reset-password",
  enforceRateLimit(passwordResetLimiter),
  validateZod({ body: resetPasswordSchema }),
  resetPassword
);

router.post("/email/verification", protect, requestEmailVerification);
router.post(
  "/email/verify",
  validateZod({ body: verifyEmailSchema }),
  verifyEmail
);

export default router;

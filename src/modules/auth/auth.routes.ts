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

const rateLimitWhenRefreshCookieExists = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.cookies?.refreshToken) return next();
  return rateLimitMiddleware(authLimiter)(req, res, next);
};

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
  rateLimitWhenRefreshCookieExists,
  refresh
);

/* ===================== LOGOUT ===================== */
router.post(
  "/logout",
  rateLimitWhenRefreshCookieExists,
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

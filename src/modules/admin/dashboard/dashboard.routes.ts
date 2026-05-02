import express, { Router } from "express";
import { getDashboard } from "./dashboard.controller.js";
import { protect, authorize } from "../../../middleware/auth.middleware.js";

const router: Router = express.Router();

/* ===================== ADMIN ONLY ===================== */
router.get(
  "/stats",
  protect,
  authorize("admin"),
  getDashboard
);

export default router;
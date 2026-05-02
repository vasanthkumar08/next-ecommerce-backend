import express, { Router } from "express";
import { getDashboard } from "./dashboard.controller";
import { protect, authorize } from "../../../middleware/auth.middleware";

const router: Router = express.Router();

/* ===================== ADMIN ONLY ===================== */
router.get(
  "/stats",
  protect,
  authorize("admin"),
  getDashboard
);

export default router;
import express, { Router } from "express";
import {
  dailyRevenue,
  monthlyRevenue,
  userGrowth,
} from "./analytics.controller";

// ✅ FIXED PATH (IMPORTANT)
import { protect, authorize } from "../../../middleware/auth.middleware";

const router: Router = express.Router();

/* ===================== ADMIN ONLY ===================== */
router.use(protect, authorize("admin"));

router.get("/daily", dailyRevenue);
router.get("/monthly", monthlyRevenue);
router.get("/users", userGrowth);

export default router;
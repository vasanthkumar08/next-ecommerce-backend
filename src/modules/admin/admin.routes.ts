import express, { Router } from "express";
import dashboardRoutes from "./dashboard/dashboard.routes.js";

const router: Router = express.Router();

// 🔥 mount dashboard
router.use("/dashboard", dashboardRoutes);

export default router;
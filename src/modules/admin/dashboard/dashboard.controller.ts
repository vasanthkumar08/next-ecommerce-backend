import { Request, Response } from "express";
import * as dashboardService from "./dashboard.service.js";
import asyncHandler from "../../../utils/asyncHandler.js";
import AppError from "../../../utils/AppError.js";
import { sendResponse } from "../../../utils/response.js";

/* ===================== GET DASHBOARD ===================== */
export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user;

    // 🔐 Admin check (important for security)
    if (!user || user.role !== "admin") {
      throw new AppError("Access denied. Admin only.", 403);
    }

    const stats = await dashboardService.getDashboardStats();

    return sendResponse(res, 200, "Dashboard data fetched successfully", stats);
  }
);
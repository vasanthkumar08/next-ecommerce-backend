import { Request, Response, NextFunction } from "express";
import * as analyticsService from "./analytics.service";

/* ===================== DAILY ===================== */
export const dailyRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const days = Number(req.query.days) || 7;

    const data = await analyticsService.getDailyRevenue(days);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================== MONTHLY ===================== */
export const monthlyRevenue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const data = await analyticsService.getMonthlyRevenue(year);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

/* ===================== USERS ===================== */
export const userGrowth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await analyticsService.getUserGrowth();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};
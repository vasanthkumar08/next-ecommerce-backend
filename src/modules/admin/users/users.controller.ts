import { Request, Response, NextFunction } from "express";
import User from "../../user/user.model.js";
import Order from "../../order/order.model.js";
import { sendResponse } from "../../../utils/response.js";

const userRoles = ["admin", "user", "moderator", "manager"] as const;
type UserRole = (typeof userRoles)[number];

const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "string" && userRoles.includes(value as UserRole);

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 50);
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter).select("-password -refreshToken").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(filter),
    ]);

    return sendResponse(res, 200, "Users fetched successfully", {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

export const setUserBlocked = async (
  req: Request<{ id: string }, unknown, { isBlocked?: boolean }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (typeof req.body.isBlocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isBlocked must be a boolean",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body.isBlocked
        ? {
            isBlocked: true,
            $unset: { refreshToken: 1 },
            $inc: { refreshTokenVersion: 1 },
          }
        : { isBlocked: false },
      { new: true, runValidators: true }
    )
      .select("-password -refreshToken")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(res, 200, "User status updated", user);
  } catch (error) {
    next(error);
  }
};

export const setUserRole = async (
  req: Request<{ id: string }, unknown, { role?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!isUserRole(req.body.role)) {
      return res.status(400).json({
        success: false,
        message: "role must be admin, user, moderator, or manager",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    )
      .select("-password -refreshToken")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return sendResponse(res, 200, "User role updated", user);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    return sendResponse(res, 200, "User orders fetched successfully", orders);
  } catch (error) {
    next(error);
  }
};

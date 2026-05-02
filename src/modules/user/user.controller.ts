import { Request, Response } from "express";
import * as userService from "./user.service";
import asyncHandler from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/response";

/* ===================== TYPES ===================== */

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

/* ===================== GET PROFILE ===================== */

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?._id) throw new Error("Unauthorized");
    const user = await userService.getMe(req.user._id);

    return sendResponse(res, 200, "Profile fetched successfully", user);
  }
);

/* ===================== UPDATE PROFILE ===================== */

export const updateMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?._id) throw new Error("Unauthorized");
    const user = await userService.updateMe(req.user._id, req.body);

    return sendResponse(res, 200, "Profile updated successfully", user);
  }
);

/* ===================== CHANGE PASSWORD ===================== */

export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?._id) throw new Error("Unauthorized");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new Error("Old password and new password are required");
    }

    const data = await userService.changePassword(
      req.user._id,
      oldPassword,
      newPassword
    );

    return sendResponse(res, 200, "Password changed successfully", data);
  }
);
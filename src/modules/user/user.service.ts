import User from "./user.model";
import AppError from "../../utils/AppError";
import { Types } from "mongoose";

/* ===================== TYPES ===================== */

type UserId = string | Types.ObjectId;

interface UpdateUserData {
  name?: string;
  email?: string;
  avatar?: {
    url?: string;
    public_id?: string;
  };
  password?: string;
}

interface QueryParams {
  page?: string;
  limit?: string;
  role?: string;
  isBlocked?: string;
}

/* ===================== FILTER UTILITY ===================== */

const filterFields = <T extends Record<string, any>>(
  obj: T,
  allowedFields: (keyof T)[]
) => {
  return Object.keys(obj)
    .filter((key) => allowedFields.includes(key as keyof T))
    .reduce((acc, key) => {
      acc[key as keyof T] = obj[key];
      return acc;
    }, {} as Partial<T>);
};

/* ===================== GET PROFILE ===================== */

export const getMe = async (userId: UserId) => {
  const user = await User.findById(userId)
    .select("-password")
    .lean();

  if (!user) throw new AppError("User not found", 404);

  return user;
};

/* ===================== UPDATE PROFILE ===================== */

export const updateMe = async (userId: UserId, data: UpdateUserData) => {
  if (data.password) {
    throw new AppError("Use change password route", 400);
  }

  const filteredData = filterFields(data, ["name", "email", "avatar"]);

  // 📧 Normalize email
  if (filteredData.email) {
    filteredData.email = filteredData.email.toLowerCase().trim();

    const existing = await User.findOne({
      email: filteredData.email,
      _id: { $ne: userId },
    });

    if (existing) {
      throw new AppError("Email already in use", 400);
    }
  }

  const user = await User.findByIdAndUpdate(userId, filteredData, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw new AppError("User not found", 404);

  return user;
};

/* ===================== CHANGE PASSWORD ===================== */

export const changePassword = async (
  userId: UserId,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) throw new AppError("User not found", 404);

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new AppError("Old password incorrect", 400);

  if (newPassword.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  user.password = newPassword;
  user.refreshToken = undefined;

  await user.save();

  return { message: "Password updated successfully" };
};

/* ===================== GET ALL USERS ===================== */

export const getAllUsers = async (query: QueryParams) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Number(query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const filter: any = {};

  if (query.role) filter.role = query.role;
  if (query.isBlocked !== undefined) {
    filter.isBlocked = query.isBlocked === "true";
  }

  const users = await User.find(filter)
    .select("-password")
    .sort("-createdAt")
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await User.countDocuments(filter);

  return {
    users,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

/* ===================== TOGGLE BLOCK ===================== */

export const toggleBlockUser = async (
  adminId: UserId,
  userId: UserId
) => {
  if (adminId.toString() === userId.toString()) {
    throw new AppError("You cannot block yourself", 400);
  }

  const user = await User.findById(userId);

  if (!user) throw new AppError("User not found", 404);

  user.isBlocked = !user.isBlocked;

  if (user.isBlocked) {
    user.refreshToken = undefined;
  }

  await user.save();

  return {
    id: user._id,
    isBlocked: user.isBlocked,
  };
};
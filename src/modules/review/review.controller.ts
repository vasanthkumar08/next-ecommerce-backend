import { Request, Response } from "express";
import * as reviewService from "./review.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import AppError from "../../utils/AppError.js";

const getUserId = (req: Request): string => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("Unauthorized", 401);
  return userId;
};

export const add = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const review = await reviewService.addReview(userId, req.body);
  return sendResponse(res, 201, "Review saved successfully", review);
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const productId =
    typeof req.params.productId === "string" ? req.params.productId : "";
  const reviews = await reviewService.getReviews(productId);
  return sendResponse(res, 200, "Reviews fetched successfully", reviews);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const id = typeof req.params.id === "string" ? req.params.id : "";
  const result = await reviewService.deleteReview(userId, id);
  return sendResponse(
    res,
    200,
    result?.message ?? "Review deleted successfully",
    result
  );
});
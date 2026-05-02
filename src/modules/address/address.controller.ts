import { Response } from "express";
import * as addressService from "./address.service";
import asyncHandler from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/response";
import AppError from "../../utils/AppError";
import { AuthRequest } from "../../types/authRequest";

/* ===================== INPUT TYPE ===================== */
// Defined here and imported by address.service.ts — single source of truth
export interface AddressInput {
  name: string;
  phone: string;
  addressLine: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  isDefault?: boolean;
}

/* ===================== HELPERS ===================== */

const getUserId = (req: AuthRequest): string => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("Unauthorized access", 401);
  return userId;
};

// ✅ Validates and narrows req.body from unknown → AddressInput
// Throws a clean 400 before touching the service layer
const parseAddressBody = (body: unknown): AddressInput => {
  if (typeof body !== "object" || body === null) {
    throw new AppError("Request body is required", 400);
  }

  const b = body as Record<string, unknown>;

  if (typeof b.name !== "string" || b.name.trim().length === 0) {
    throw new AppError("Name is required", 400);
  }
  if (typeof b.phone !== "string" || b.phone.trim().length === 0) {
    throw new AppError("Phone is required", 400);
  }
  if (typeof b.addressLine !== "string" || b.addressLine.trim().length === 0) {
    throw new AppError("Address line is required", 400);
  }

  return {
    name:        b.name.trim(),
    phone:       b.phone.trim(),
    addressLine: b.addressLine.trim(),
    city:        typeof b.city === "string" ? b.city.trim() : undefined,
    state:       typeof b.state === "string" ? b.state.trim() : undefined,
    pincode:     typeof b.pincode === "string" ? b.pincode.trim() : undefined,
    country:     typeof b.country === "string" ? b.country.trim() : undefined,
    isDefault:   typeof b.isDefault === "boolean" ? b.isDefault : undefined,
  };
};

/* ===================== CONTROLLERS ===================== */

export const add = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  // ✅ FIX: narrow unknown → AddressInput before passing to service
  const input = parseAddressBody(req.body);
  const address = await addressService.addAddress(userId, input);
  return sendResponse(res, 201, "Address added successfully", address);
});

export const getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const addresses = await addressService.getAddresses(userId);
  return sendResponse(res, 200, "Addresses fetched successfully", addresses);
});

export const setDefault = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = getUserId(req);
    const id = typeof req.params.id === "string" ? req.params.id : "";
    if (!id) throw new AppError("Address ID required", 400);
    const updated = await addressService.setDefaultAddress(userId, id);
    return sendResponse(res, 200, "Default address updated", updated);
  }
);

export const remove = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = getUserId(req);
  const id = typeof req.params.id === "string" ? req.params.id : "";
  if (!id) throw new AppError("Address ID required", 400);
  const result = await addressService.deleteAddress(userId, id);
  return sendResponse(res, 200, result?.message ?? "Address deleted successfully");
});
import { Response } from "express";
import * as addressService from "./address.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/response.js";
import AppError from "../../utils/AppError.js";
import { AuthRequest } from "../../types/authRequest.js";

/* ===================== INPUT TYPE ===================== */
// Defined here and imported by address.service.ts — single source of truth
export interface AddressInput {
  name: string;
  phone: string;
  alternatePhone?: string;
  houseNumber?: string;
  apartment?: string;
  addressLine: string;
  street?: string;
  landmark?: string;
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
  const addressLine =
    typeof b.addressLine === "string" && b.addressLine.trim().length > 0
      ? b.addressLine.trim()
      : [
          typeof b.houseNumber === "string" ? b.houseNumber.trim() : "",
          typeof b.apartment === "string" ? b.apartment.trim() : "",
          typeof b.street === "string" ? b.street.trim() : "",
          typeof b.landmark === "string" ? b.landmark.trim() : "",
        ]
          .filter(Boolean)
          .join(", ");

  if (!/^[6-9]\d{9}$/.test(b.phone.trim())) {
    throw new AppError("Valid 10-digit phone number is required", 400);
  }

  if (
    typeof b.alternatePhone === "string" &&
    b.alternatePhone.trim().length > 0 &&
    !/^[6-9]\d{9}$/.test(b.alternatePhone.trim())
  ) {
    throw new AppError("Valid alternate phone number is required", 400);
  }

  if (typeof b.pincode === "string" && !/^[1-9][0-9]{5}$/.test(b.pincode.trim())) {
    throw new AppError("Valid 6-digit postal code is required", 400);
  }

  if (addressLine.length === 0) {
    throw new AppError("Address line is required", 400);
  }

  return {
    name:        b.name.trim(),
    phone:       b.phone.trim(),
    alternatePhone:
      typeof b.alternatePhone === "string" && b.alternatePhone.trim().length > 0
        ? b.alternatePhone.trim()
        : undefined,
    houseNumber: typeof b.houseNumber === "string" ? b.houseNumber.trim() : undefined,
    apartment:   typeof b.apartment === "string" ? b.apartment.trim() : undefined,
    addressLine,
    street:      typeof b.street === "string" ? b.street.trim() : undefined,
    landmark:    typeof b.landmark === "string" ? b.landmark.trim() : undefined,
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

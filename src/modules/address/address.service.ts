import mongoose from "mongoose";
import Address, { AddressDocument } from "./address.model.js";
import AppError from "../../utils/AppError.js";
// ✅ Single source of truth — type lives in controller, imported here
import type { AddressInput } from "./address.controller.js";

export const addAddress = async (
  userId: string,
  data: AddressInput
): Promise<AddressDocument> => {
  const isFirstAddress = await Address.countDocuments({ user: userId });

  const address = await Address.create({
    ...data,
    user: new mongoose.Types.ObjectId(userId),
    isDefault: isFirstAddress === 0 ? true : (data.isDefault ?? false),
  });

  if (address.isDefault) {
    await Address.updateMany(
      { user: userId, _id: { $ne: address._id } },
      { isDefault: false }
    );
  }

  return address;
};

export const getAddresses = async (
  userId: string
): Promise<Partial<AddressDocument>[]> => {
  return Address.find({ user: userId })
    .sort("-isDefault -createdAt")
    .lean();
};

export const setDefaultAddress = async (
  userId: string,
  addressId: string
): Promise<AddressDocument | null> => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError("Address not found", 404);

  await Address.updateMany({ user: userId }, { $set: { isDefault: false } });

  return Address.findByIdAndUpdate(
    addressId,
    { $set: { isDefault: true } },
    { new: true }
  );
};

export const deleteAddress = async (
  userId: string,
  addressId: string
): Promise<{ message: string }> => {
  const address = await Address.findOne({ _id: addressId, user: userId });
  if (!address) throw new AppError("Address not found", 404);

  const wasDefault = address.isDefault;
  await address.deleteOne();

  if (wasDefault) {
    const next = await Address.findOne({ user: userId });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }

  return { message: "Address deleted successfully" };
};
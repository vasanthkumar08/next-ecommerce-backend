import mongoose, { Schema, Document, Model } from "mongoose";

/* ===================== TYPES ===================== */
export interface AddressDocument extends Document {
  user: mongoose.Types.ObjectId;
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
  country: string;
  addressType: "Home" | "Work" | "Office" | "Other";
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/* ===================== SCHEMA ===================== */
const addressSchema: Schema<AddressDocument> = new Schema(
  {
    // 👤 Owner
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // 🏷️ Recipient name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, "Invalid phone number"],
    },

    alternatePhone: {
      type: String,
      trim: true,
      match: [/^$|^\+?[0-9]{7,15}$/, "Invalid alternate phone number"],
    },

    houseNumber: {
      type: String,
      trim: true,
      maxlength: 80,
    },

    apartment: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    // 🏠 Address line
    addressLine: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: 200,
    },

    street: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    landmark: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    // 🌆 Location fields
    city: {
      type: String,
      trim: true,
      index: true,
    },

    state: {
      type: String,
      trim: true,
      index: true,
    },

    pincode: {
      type: String,
      trim: true,
      match: [/^[A-Za-z0-9][A-Za-z0-9 -]{2,11}$/, "Invalid postal code"],
      index: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    addressType: {
      type: String,
      enum: ["Home", "Work", "Office", "Other"],
      default: "Home",
      index: true,
    },

    // ⭐ Default address flag
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===================== INDEX ===================== */
addressSchema.index({ user: 1, isDefault: 1 });

/* ===================== MODEL ===================== */
const Address: Model<AddressDocument> = mongoose.model<AddressDocument>(
  "Address",
  addressSchema
);

export default Address;

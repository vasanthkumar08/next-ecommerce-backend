import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
/* ===================== TYPES ===================== */

export interface IAvatar {
  url: string;
  public_id: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "manager";
  isBlocked: boolean;
  avatar: IAvatar;
  passwordChangedAt?: Date;
  refreshToken?: string;
  refreshTokenVersion: number;

  comparePassword(password: string): Promise<boolean>;
  isPasswordChanged(jwtTimestamp: number): boolean;
}

/* ===================== SCHEMAS ===================== */

const avatarSchema = new Schema<IAvatar>(
  {
    url: { type: String, default: "" },
    public_id: { type: String, default: "" },
  },
  { _id: false }
);

/* ===================== USER SCHEMA ===================== */

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin", "manager"],
      default: "user",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    avatar: avatarSchema,

    passwordChangedAt: Date,

    refreshToken: {
      type: String,
      select: false,
    },

    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===================== MIDDLEWARE ===================== */

/**
 * 🔐 Hash password before save
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

});

/* ===================== METHODS ===================== */

/**
 * 🔑 Compare password
 */
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

/**
 * 🔐 Check password change after JWT issue
 */
userSchema.methods.isPasswordChanged = function (
  jwtTimestamp: number
): boolean {
  if (!this.passwordChangedAt) return false;

  const changedTime = Math.floor(
    this.passwordChangedAt.getTime() / 1000
  );

  return jwtTimestamp < changedTime;
};

/* ===================== MODEL ===================== */

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;

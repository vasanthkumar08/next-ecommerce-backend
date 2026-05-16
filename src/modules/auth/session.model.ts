import mongoose, { Document, Model, Schema, Types } from "mongoose";
import type { AuthRole } from "./auth.types.js";

export type SessionStatus = "active" | "revoked" | "expired";

export interface IAuthSession extends Document {
  user: Types.ObjectId;
  role: AuthRole;
  status: SessionStatus;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  refreshTokenId: string;
  rememberMe: boolean;
  lastActiveAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const authSessionSchema = new Schema<IAuthSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: {
      type: String,
      enum: ["user", "admin", "moderator", "manager"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      index: true,
    },
    deviceId: { type: String, required: true, index: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    refreshTokenId: { type: String, required: true, index: true },
    rememberMe: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now, index: true },
    expiresAt: { type: Date, required: true, index: true },
    revokedAt: Date,
    revokedReason: String,
  },
  { timestamps: true, versionKey: false }
);

authSessionSchema.index({ user: 1, status: 1, lastActiveAt: -1 });
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const AuthSession: Model<IAuthSession> = mongoose.model<IAuthSession>(
  "AuthSession",
  authSessionSchema
);

export default AuthSession;

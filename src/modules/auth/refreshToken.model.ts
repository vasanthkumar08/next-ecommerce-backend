import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type RefreshTokenStatus = "active" | "rotated" | "revoked" | "reused";

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  session: Types.ObjectId;
  tokenId: string;
  tokenHash: string;
  status: RefreshTokenStatus;
  replacedByTokenId?: string;
  expiresAt: Date;
  rotatedAt?: Date;
  revokedAt?: Date;
  reusedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    session: {
      type: Schema.Types.ObjectId,
      ref: "AuthSession",
      required: true,
      index: true,
    },
    tokenId: { type: String, required: true, unique: true, index: true },
    tokenHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "rotated", "revoked", "reused"],
      default: "active",
      index: true,
    },
    replacedByTokenId: String,
    expiresAt: { type: Date, required: true, index: true },
    rotatedAt: Date,
    revokedAt: Date,
    reusedAt: Date,
  },
  { timestamps: true, versionKey: false }
);

refreshTokenSchema.index({ session: 1, status: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken: Model<IRefreshToken> = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);

export default RefreshToken;

import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type OtpPurpose = "email_verification" | "password_reset";

export interface IOtpRequest extends Document {
  user: Types.ObjectId;
  purpose: OtpPurpose;
  tokenHash: string;
  consumedAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const otpRequestSchema = new Schema<IOtpRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    purpose: {
      type: String,
      enum: ["email_verification", "password_reset"],
      required: true,
      index: true,
    },
    tokenHash: { type: String, required: true, unique: true },
    consumedAt: Date,
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true, versionKey: false }
);

otpRequestSchema.index({ user: 1, purpose: 1, createdAt: -1 });
otpRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpRequest: Model<IOtpRequest> = mongoose.model<IOtpRequest>(
  "OtpRequest",
  otpRequestSchema
);

export default OtpRequest;

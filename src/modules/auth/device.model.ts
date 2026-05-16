import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IDevice extends Document {
  user: Types.ObjectId;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now, index: true },
    revokedAt: Date,
  },
  { timestamps: true, versionKey: false }
);

deviceSchema.index({ user: 1, deviceId: 1 }, { unique: true });

const Device: Model<IDevice> = mongoose.model<IDevice>("Device", deviceSchema);

export default Device;

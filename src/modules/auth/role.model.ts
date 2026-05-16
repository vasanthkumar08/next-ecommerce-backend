import mongoose, { Document, Model, Schema } from "mongoose";
import type { AuthRole } from "./auth.types.js";

export interface IRole extends Document {
  name: AuthRole;
  permissions: string[];
  isSystem: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      enum: ["user", "admin", "moderator", "manager"],
      required: true,
      unique: true,
      index: true,
    },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: true },
    deletedAt: { type: Date, index: true },
  },
  { timestamps: true, versionKey: false }
);

roleSchema.index({ name: 1, deletedAt: 1 });

const Role: Model<IRole> = mongoose.model<IRole>("Role", roleSchema);

export default Role;

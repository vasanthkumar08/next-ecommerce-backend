import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type AuditAction =
  | "REGISTER"
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "OAUTH_LOGIN"
  | "LOGOUT"
  | "LOGOUT_ALL"
  | "REFRESH_ROTATED"
  | "REFRESH_REUSE_DETECTED"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "EMAIL_VERIFICATION_REQUEST"
  | "EMAIL_VERIFIED"
  | "SESSION_REVOKED"
  | "ROLE_CHANGED";

export interface IAuditLog extends Document {
  user?: Types.ObjectId;
  action: AuditAction;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true, index: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    success: { type: Boolean, default: true, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema
);

export default AuditLog;

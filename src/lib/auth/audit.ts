import type { Types } from "mongoose";
import AuditLog, { AuditAction } from "../../modules/auth/auditLog.model.js";
import type { RequestContext } from "../../modules/auth/auth.types.js";

export const writeAuditLog = async (input: {
  userId?: string | Types.ObjectId;
  action: AuditAction;
  context: RequestContext;
  success?: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}): Promise<void> => {
  try {
    await AuditLog.create({
      user: input.userId,
      action: input.action,
      ipAddress: input.context.ip,
      userAgent: input.context.userAgent,
      success: input.success ?? true,
      metadata: input.metadata,
    });
  } catch (error) {
    // Auth must not fail because the audit sink is temporarily unavailable.
    console.error("Audit log write failed:", error);
  }
};

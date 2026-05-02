import crypto from "crypto";

/**
 * 🔐 Hash token using SHA-256
 */
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
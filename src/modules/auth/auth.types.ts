import type { AuthRole } from "../../constants/auth.constants.js";

export type { AuthRole };

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  emailVerified: boolean;
}

export interface RequestContext {
  ip: string;
  userAgent: string;
}

export interface AuthSessionPayload {
  userId: string;
  sessionId: string;
  refreshTokenId: string;
  role: AuthRole;
}

import type { Request } from "express";
import { authCookieNames } from "../lib/auth/cookies.js";
import { resolveAuthSessionFromToken } from "../lib/auth/resolveSession.js";

export interface GraphQLUser {
  _id: string;
  role: string;
  email: string;
  sessionId: string;
}

export interface GraphQLContext {
  user: GraphQLUser | null;
}

export const createContext = async ({ req }: { req: Request }): Promise<GraphQLContext> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : typeof req.cookies?.[authCookieNames.access] === "string"
      ? req.cookies[authCookieNames.access]
      : undefined;

  if (!token) return { user: null };

  try {
    const authSession = await resolveAuthSessionFromToken(token);
    if (!authSession) return { user: null };

    return {
      user: {
        _id: authSession.userId,
        role: authSession.role,
        email: authSession.email,
        sessionId: authSession.sessionId,
      },
    };
  } catch {
    return { user: null };
  }
};

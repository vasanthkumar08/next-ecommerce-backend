import User from "../../modules/user/user.model.js";
import AuthSession from "../../modules/auth/session.model.js";
import { verifyAccessToken } from "../../utils/jwt.js";
import { cacheSession, getCachedSession } from "./sessionCache.js";
import type { AuthRole } from "../../constants/auth.constants.js";

export interface ResolvedAuthSession {
  userId: string;
  role: AuthRole;
  email: string;
  sessionId: string;
}

export const resolveAuthSessionFromToken = async (
  token: string
): Promise<ResolvedAuthSession | null> => {
  const decoded = verifyAccessToken(token);
  const userId = decoded.sub;
  const sessionId = decoded.sid;

  if (!userId || !sessionId) return null;

  const cachedSession = await getCachedSession(sessionId);

  if (!cachedSession) {
    const session = await AuthSession.findOne({
      _id: sessionId,
      user: userId,
      status: "active",
      expiresAt: { $gt: new Date() },
    }).select("role refreshTokenId expiresAt");

    if (!session) return null;

    await cacheSession(
      sessionId,
      userId,
      {
        userId,
        role: session.role,
        refreshTokenId: session.refreshTokenId,
        revoked: false,
      },
      Math.max(Math.floor((session.expiresAt.getTime() - Date.now()) / 1000), 60)
    );
  } else if (cachedSession.revoked || cachedSession.userId !== userId) {
    return null;
  }

  const user = await User.findById(userId).select("email role isBlocked");

  if (!user || user.isBlocked) return null;

  return {
    userId: user._id.toString(),
    role: user.role,
    email: user.email,
    sessionId,
  };
};

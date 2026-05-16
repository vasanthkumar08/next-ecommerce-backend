import redis from "../../config/redis.js";
import type { AuthRole } from "../../modules/auth/auth.types.js";

export interface CachedSession {
  userId: string;
  role: AuthRole;
  refreshTokenId: string;
  revoked: boolean;
}

const keyForSession = (sessionId: string) => `auth:session:${sessionId}`;
const userSessionsKey = (userId: string) => `auth:user:${userId}:sessions`;

export const cacheSession = async (
  sessionId: string,
  userId: string,
  session: CachedSession,
  ttlSeconds: number
): Promise<void> => {
  // Redis keeps the hot path cheap: middleware can validate active sessions
  // without hitting MongoDB on every API request.
  await redis
    .multi()
    .set(keyForSession(sessionId), JSON.stringify(session), "EX", ttlSeconds)
    .sadd(userSessionsKey(userId), sessionId)
    .expire(userSessionsKey(userId), ttlSeconds)
    .exec();
};

export const getCachedSession = async (
  sessionId: string
): Promise<CachedSession | null> => {
  const raw = await redis.get(keyForSession(sessionId));
  if (!raw) return null;

  const parsed = JSON.parse(raw) as CachedSession;
  return parsed;
};

export const revokeCachedSession = async (sessionId: string): Promise<void> => {
  await redis.del(keyForSession(sessionId));
};

export const revokeAllCachedSessions = async (userId: string): Promise<void> => {
  const setKey = userSessionsKey(userId);
  const sessionIds = await redis.smembers(setKey);

  if (sessionIds.length > 0) {
    await redis.del(...sessionIds.map(keyForSession));
  }

  await redis.del(setKey);
};

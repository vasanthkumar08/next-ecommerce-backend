import crypto from "node:crypto";
import mongoose from "mongoose";
import User, { IUser } from "../user/user.model.js";
import AuthSession from "./session.model.js";
import RefreshToken from "./refreshToken.model.js";
import Device from "./device.model.js";
import OtpRequest, { OtpPurpose } from "./otpRequest.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { hashToken } from "../../utils/hash.js";
import AppError from "../../utils/AppError.js";
import { cacheSession, revokeAllCachedSessions, revokeCachedSession } from "../../lib/auth/sessionCache.js";
import { writeAuditLog } from "../../lib/auth/audit.js";
import type { AuthRole, PublicUser, RequestContext } from "./auth.types.js";
import type { LoginInput, OAuthSessionInput, RegisterInput } from "./auth.validator.js";

const accessTokenTtlSeconds = 15 * 60;
const standardSessionTtlSeconds = 7 * 24 * 60 * 60;
const rememberedSessionTtlSeconds = 30 * 24 * 60 * 60;
const otpTtlSeconds = 15 * 60;
const refreshRotationRaceGraceMs = 5_000;

interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  rememberMe: boolean;
}

const toPublicUser = (user: IUser): PublicUser => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
});

const expiryFromNow = (seconds: number): Date =>
  new Date(Date.now() + seconds * 1000);

const newOpaqueToken = (): string => crypto.randomBytes(48).toString("base64url");

const safeEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const deviceIdFromContext = (context: RequestContext): string =>
  crypto
    .createHash("sha256")
    .update(`${context.userAgent}:${context.ip}`)
    .digest("hex");

const isRecentRotationRace = (rotatedAt?: Date): boolean =>
  Boolean(
    rotatedAt &&
      Date.now() - rotatedAt.getTime() >= 0 &&
      Date.now() - rotatedAt.getTime() <= refreshRotationRaceGraceMs
  );

const createTokenPair = (user: IUser, sessionId: string, tokenId: string) => {
  const accessToken = generateAccessToken({
    _id: user._id.toString(),
    role: user.role,
    sessionId,
  });

  const refresh = generateRefreshToken({
    userId: user._id.toString(),
    sessionId,
    tokenId,
  });

  return { accessToken, refreshToken: refresh.token };
};

const createAuthSessionForUser = async (
  user: IUser,
  context: RequestContext,
  options: {
    rememberMe?: boolean;
    auditAction: "LOGIN_SUCCESS" | "OAUTH_LOGIN";
    auditMetadata?: Record<string, string | number | boolean | null>;
  }
): Promise<AuthResult> => {
  const rememberMe = Boolean(options.rememberMe);
  const ttl = rememberMe ? rememberedSessionTtlSeconds : standardSessionTtlSeconds;
  const refreshTokenId = crypto.randomUUID();
  const deviceId = deviceIdFromContext(context);

  const session = await AuthSession.create({
    user: user._id,
    role: user.role,
    deviceId,
    userAgent: context.userAgent,
    ipAddress: context.ip,
    refreshTokenId,
    rememberMe,
    expiresAt: expiryFromNow(ttl),
  });

  const { accessToken, refreshToken } = createTokenPair(
    user,
    session._id.toString(),
    refreshTokenId
  );

  await Promise.all([
    RefreshToken.create({
      user: user._id,
      session: session._id,
      tokenId: refreshTokenId,
      tokenHash: hashToken(refreshToken),
      expiresAt: expiryFromNow(ttl),
    }),
    Device.findOneAndUpdate(
      { user: user._id, deviceId },
      {
        user: user._id,
        deviceId,
        userAgent: context.userAgent,
        ipAddress: context.ip,
        lastSeenAt: new Date(),
        $setOnInsert: { firstSeenAt: new Date() },
      },
      { upsert: true, new: true }
    ),
    cacheSession(
      session._id.toString(),
      user._id.toString(),
      {
        userId: user._id.toString(),
        role: user.role,
        refreshTokenId,
        revoked: false,
      },
      ttl
    ),
    writeAuditLog({
      userId: user._id,
      action: options.auditAction,
      context,
      metadata: {
        sessionId: session._id.toString(),
        rememberMe,
        ...(options.auditMetadata ?? {}),
      },
    }),
  ]);

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
    rememberMe,
  };
};

export const registerUser = async (
  data: RegisterInput,
  context?: RequestContext
): Promise<IUser> => {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw new AppError("User already exists", 409);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
  });

  if (context) {
    await writeAuditLog({
      userId: user._id,
      action: "REGISTER",
      context,
    });
  }

  return user;
};

export const loginUser = async (
  { email, password, rememberMe }: LoginInput,
  context: RequestContext
): Promise<AuthResult> => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    await writeAuditLog({
      action: "LOGIN_FAILED",
      context,
      success: false,
      metadata: { email },
    });
    throw new AppError("Invalid email or password", 401);
  }

  if (user.isBlocked) {
    await writeAuditLog({
      userId: user._id,
      action: "LOGIN_FAILED",
      context,
      success: false,
      metadata: { reason: "blocked" },
    });
    throw new AppError("Your account has been blocked", 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await writeAuditLog({
      userId: user._id,
      action: "LOGIN_FAILED",
      context,
      success: false,
    });
    throw new AppError("Invalid email or password", 401);
  }

  return createAuthSessionForUser(user, context, {
    rememberMe,
    auditAction: "LOGIN_SUCCESS",
  });
};

export const oauthLoginUser = async (
  data: OAuthSessionInput,
  context: RequestContext
): Promise<AuthResult> => {
  let user = await User.findOne({ email: data.email });

  if (!user) {
    user = await User.create({
      name: data.name ?? data.email.split("@")[0],
      email: data.email,
      password: newOpaqueToken(),
      emailVerified: Boolean(data.emailVerified),
      emailVerifiedAt: data.emailVerified ? new Date() : undefined,
      avatar: data.avatarUrl ? { url: data.avatarUrl, public_id: "" } : undefined,
    });
  } else if (data.emailVerified && !user.emailVerified) {
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
  }

  if (user.isBlocked) {
    await writeAuditLog({
      userId: user._id,
      action: "LOGIN_FAILED",
      context,
      success: false,
      metadata: { provider: data.provider, reason: "blocked" },
    });
    throw new AppError("Your account has been blocked", 403);
  }

  return createAuthSessionForUser(user, context, {
    rememberMe: data.rememberMe,
    auditAction: "OAUTH_LOGIN",
    auditMetadata: {
      provider: data.provider,
      providerAccountId: data.providerAccountId,
    },
  });
};

export const refreshTokenService = async (
  incomingToken: string,
  context: RequestContext
): Promise<AuthResult> => {
  if (!incomingToken) throw new AppError("No refresh token provided", 401);

  const decoded = verifyRefreshToken(incomingToken);
  const session = await AuthSession.findById(decoded.sid);

  if (!session || session.status !== "active" || session.expiresAt <= new Date()) {
    throw new AppError("Refresh token expired or invalid", 401);
  }

  const storedToken = await RefreshToken.findOne({
    tokenId: decoded.jti,
    session: session._id,
  });

  const incomingHash = hashToken(incomingToken);
  const tokenMatches =
    storedToken?.tokenHash && safeEqual(storedToken.tokenHash, incomingHash);

  if (
    storedToken &&
    storedToken.status === "rotated" &&
    tokenMatches &&
    isRecentRotationRace(storedToken.rotatedAt)
  ) {
    await writeAuditLog({
      userId: session.user,
      action: "REFRESH_ROTATION_RACE",
      context,
      metadata: {
        sessionId: session._id.toString(),
        tokenId: decoded.jti,
        replacedByTokenId: storedToken.replacedByTokenId ?? null,
      },
    });

    throw new AppError("Refresh already rotated", 409, {
      code: "REFRESH_ROTATION_IN_PROGRESS",
    });
  }

  if (!storedToken || storedToken.status !== "active" || !tokenMatches) {
    // Refresh reuse means an already-rotated token appeared again. Treat that as
    // credential theft and revoke every active session for the account.
    await Promise.all([
      AuthSession.updateMany(
        { user: session.user, status: "active" },
        {
          status: "revoked",
          revokedAt: new Date(),
          revokedReason: "refresh_token_reuse",
        }
      ),
      RefreshToken.updateMany(
        { user: session.user, status: "active" },
        { status: "revoked", revokedAt: new Date() }
      ),
      revokeAllCachedSessions(session.user.toString()),
      writeAuditLog({
        userId: session.user,
        action: "REFRESH_REUSE_DETECTED",
        context,
        success: false,
        metadata: { sessionId: session._id.toString() },
      }),
    ]);

    throw new AppError("Suspicious session activity detected", 401);
  }

  const user = await User.findById(session.user);
  if (!user || user.isBlocked) {
    throw new AppError("Refresh token expired or invalid", 401);
  }

  const nextRefreshTokenId = crypto.randomUUID();
  const ttl = session.rememberMe
    ? rememberedSessionTtlSeconds
    : standardSessionTtlSeconds;
  const { accessToken, refreshToken } = createTokenPair(
    user,
    session._id.toString(),
    nextRefreshTokenId
  );

  const now = new Date();
  const nextExpiresAt = expiryFromNow(ttl);

  const rotateResult = await RefreshToken.updateOne(
    {
      _id: storedToken._id,
      session: session._id,
      tokenId: decoded.jti,
      tokenHash: incomingHash,
      status: "active",
    },
    {
      $set: {
        status: "rotated",
        rotatedAt: now,
        replacedByTokenId: nextRefreshTokenId,
      },
    }
  );

  if (rotateResult.modifiedCount !== 1) {
    const racedToken = await RefreshToken.findOne({
      tokenId: decoded.jti,
      session: session._id,
    });

    if (
      racedToken &&
      racedToken.status === "rotated" &&
      racedToken.tokenHash &&
      safeEqual(racedToken.tokenHash, incomingHash) &&
      isRecentRotationRace(racedToken.rotatedAt)
    ) {
      await writeAuditLog({
        userId: session.user,
        action: "REFRESH_ROTATION_RACE",
        context,
        metadata: {
          sessionId: session._id.toString(),
          tokenId: decoded.jti,
          replacedByTokenId: racedToken.replacedByTokenId ?? null,
        },
      });

      throw new AppError("Refresh already rotated", 409, {
        code: "REFRESH_ROTATION_IN_PROGRESS",
      });
    }

    throw new AppError("Refresh token expired or invalid", 401);
  }

  await Promise.all([
    AuthSession.updateOne(
      {
        _id: session._id,
        status: "active",
        refreshTokenId: decoded.jti,
      },
      {
        $set: {
          refreshTokenId: nextRefreshTokenId,
          lastActiveAt: now,
          expiresAt: nextExpiresAt,
          ipAddress: context.ip,
          userAgent: context.userAgent,
        },
      }
    ),
    RefreshToken.create({
      user: user._id,
      session: session._id,
      tokenId: nextRefreshTokenId,
      tokenHash: hashToken(refreshToken),
      expiresAt: nextExpiresAt,
    }),
    cacheSession(
      session._id.toString(),
      user._id.toString(),
      {
        userId: user._id.toString(),
        role: user.role,
        refreshTokenId: nextRefreshTokenId,
        revoked: false,
      },
      ttl
    ),
    writeAuditLog({
      userId: user._id,
      action: "REFRESH_ROTATED",
      context,
      metadata: { sessionId: session._id.toString() },
    }),
  ]);

  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
    rememberMe: session.rememberMe,
  };
};

export const logoutUser = async (
  incomingToken: string | undefined,
  context: RequestContext
): Promise<void> => {
  if (!incomingToken) return;

  const decoded = verifyRefreshToken(incomingToken);

  await Promise.all([
    AuthSession.findByIdAndUpdate(decoded.sid, {
      status: "revoked",
      revokedAt: new Date(),
      revokedReason: "logout",
    }),
    RefreshToken.updateMany(
      { session: new mongoose.Types.ObjectId(decoded.sid), status: "active" },
      { status: "revoked", revokedAt: new Date() }
    ),
    revokeCachedSession(decoded.sid),
    writeAuditLog({
      userId: decoded.sub,
      action: "LOGOUT",
      context,
      metadata: { sessionId: decoded.sid },
    }),
  ]);
};

export const logoutAllDevices = async (
  userId: string,
  context: RequestContext
): Promise<void> => {
  await Promise.all([
    AuthSession.updateMany(
      { user: userId, status: "active" },
      { status: "revoked", revokedAt: new Date(), revokedReason: "logout_all" }
    ),
    RefreshToken.updateMany(
      { user: userId, status: "active" },
      { status: "revoked", revokedAt: new Date() }
    ),
    revokeAllCachedSessions(userId),
    writeAuditLog({
      userId,
      action: "LOGOUT_ALL",
      context,
    }),
  ]);
};

export const listActiveSessions = async (userId: string) => {
  return AuthSession.find({ user: userId, status: "active" })
    .sort({ lastActiveAt: -1 })
    .select("deviceId userAgent ipAddress lastActiveAt createdAt expiresAt rememberMe")
    .lean();
};

export const revokeSession = async (
  userId: string,
  sessionId: string,
  context: RequestContext
): Promise<void> => {
  const session = await AuthSession.findOne({ _id: sessionId, user: userId });

  if (!session) throw new AppError("Session not found", 404);

  await Promise.all([
    AuthSession.findByIdAndUpdate(sessionId, {
      status: "revoked",
      revokedAt: new Date(),
      revokedReason: "user_revoked_device",
    }),
    RefreshToken.updateMany(
      { session: session._id, status: "active" },
      { status: "revoked", revokedAt: new Date() }
    ),
    revokeCachedSession(sessionId),
    writeAuditLog({
      userId,
      action: "SESSION_REVOKED",
      context,
      metadata: { sessionId },
    }),
  ]);
};

const createOtp = async (
  user: IUser,
  purpose: OtpPurpose,
  context: RequestContext
): Promise<string> => {
  const token = newOpaqueToken();

  await OtpRequest.create({
    user: user._id,
    purpose,
    tokenHash: hashToken(token),
    expiresAt: expiryFromNow(otpTtlSeconds),
  });

  await writeAuditLog({
    userId: user._id,
    action:
      purpose === "password_reset"
        ? "PASSWORD_RESET_REQUEST"
        : "EMAIL_VERIFICATION_REQUEST",
    context,
  });

  return token;
};

export const requestEmailVerification = async (
  userId: string,
  context: RequestContext
): Promise<{ message: string; token?: string }> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.emailVerified) {
    return { message: "Email already verified" };
  }

  const token = await createOtp(user, "email_verification", context);
  return {
    message: "Verification email queued",
    token: process.env.NODE_ENV === "production" ? undefined : token,
  };
};

export const verifyEmail = async (
  token: string,
  context: RequestContext
): Promise<{ message: string }> => {
  const tokenHash = hashToken(token);
  const request = await OtpRequest.findOne({
    tokenHash,
    purpose: "email_verification",
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!request) throw new AppError("Verification token is invalid or expired", 400);

  await Promise.all([
    User.findByIdAndUpdate(request.user, {
      emailVerified: true,
      emailVerifiedAt: new Date(),
    }),
    OtpRequest.findByIdAndUpdate(request._id, { consumedAt: new Date() }),
    writeAuditLog({
      userId: request.user,
      action: "EMAIL_VERIFIED",
      context,
    }),
  ]);

  return { message: "Email verified successfully" };
};

export const forgotPassword = async (
  email: string,
  context: RequestContext
): Promise<{ message: string; token?: string }> => {
  const user = await User.findOne({ email });

  if (!user) {
    return { message: "If the email exists, a reset link has been sent" };
  }

  const token = await createOtp(user, "password_reset", context);

  return {
    message: "If the email exists, a reset link has been sent",
    token: process.env.NODE_ENV === "production" ? undefined : token,
  };
};

export const resetPassword = async (
  token: string,
  password: string,
  context: RequestContext
): Promise<{ message: string }> => {
  const request = await OtpRequest.findOne({
    tokenHash: hashToken(token),
    purpose: "password_reset",
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });

  if (!request) throw new AppError("Reset token is invalid or expired", 400);

  const user = await User.findById(request.user);
  if (!user) throw new AppError("User not found", 404);

  user.password = password;
  user.refreshToken = undefined;
  user.refreshTokenVersion += 1;

  await Promise.all([
    user.save(),
    OtpRequest.findByIdAndUpdate(request._id, { consumedAt: new Date() }),
    logoutAllDevices(user._id.toString(), context),
    writeAuditLog({
      userId: user._id,
      action: "PASSWORD_RESET_SUCCESS",
      context,
    }),
  ]);

  return { message: "Password reset successfully" };
};

export const normalizeRole = (role: string | undefined): AuthRole =>
  role === "admin" || role === "moderator" || role === "manager" ? role : "user";

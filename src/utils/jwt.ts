import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";

/* ===================== TYPES ===================== */

interface UserPayload {
  _id: string;
  role: string;
  sessionId: string;
}

interface AccessTokenPayload {
  sub: string;
  role: string;
  sid: string;
  typ: "access";
}

interface RefreshTokenPayload {
  jti: string;
  sub: string;
  sid: string;
  typ: "refresh";
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
}

/* ===================== ACCESS TOKEN ===================== */

export const generateAccessToken = (user: UserPayload): string => {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
      sid: user.sessionId,
      typ: "access",
    } as AccessTokenPayload,
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN,
      issuer: "your-app",
      audience: "your-app-users",
    }
  );
};

/* ===================== REFRESH TOKEN ===================== */

export const generateRefreshToken = (payload: {
  userId: string;
  sessionId: string;
  tokenId?: string;
}): { token: string; jti: string } => {
  const jti = payload.tokenId ?? crypto.randomUUID();

  const token = jwt.sign(
    {
      jti,
      sub: payload.userId,
      sid: payload.sessionId,
      typ: "refresh",
    } as RefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      issuer: "your-app",
      audience: "your-app-users",
    }
  );

  return { token, jti };
};

/* ===================== VERIFY TOKENS ===================== */

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: "your-app",
    audience: "your-app-users",
  }) as AccessTokenPayload;

  if (decoded.typ !== "access") {
    throw new Error("Invalid token type");
  }

  return decoded;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "your-app",
    audience: "your-app-users",
  }) as RefreshTokenPayload;

  if (decoded.typ !== "refresh") {
    throw new Error("Invalid token type");
  }

  return decoded;
};

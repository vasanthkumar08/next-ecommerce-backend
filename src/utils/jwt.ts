import jwt from "jsonwebtoken";
import crypto from "crypto";
import env from "../config/env.js";

/* ===================== TYPES ===================== */

interface UserPayload {
  _id: string;
  role: string;
}

interface AccessTokenPayload {
  sub: string;
  role: string;
}

interface RefreshTokenPayload {
  jti: string;
  iss?: string;
  sub?: string;
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

export const generateRefreshToken = (): { token: string; jti: string } => {
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    { jti },
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
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: "your-app",
    audience: "your-app-users",
  }) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "your-app",
    audience: "your-app-users",
  }) as RefreshTokenPayload;
};

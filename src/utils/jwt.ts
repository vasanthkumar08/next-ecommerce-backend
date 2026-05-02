import jwt from "jsonwebtoken";
import crypto from "crypto";

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
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15m",
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
    process.env.JWT_REFRESH_SECRET as string,
    {
      expiresIn: "7d",
      issuer: "your-app",
      audience: "your-app-users",
    }
  );

  return { token, jti };
};

/* ===================== VERIFY TOKENS ===================== */

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string, {
    issuer: "your-app",
    audience: "your-app-users",
  }) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, {
    issuer: "your-app",
    audience: "your-app-users",
  }) as RefreshTokenPayload;
};

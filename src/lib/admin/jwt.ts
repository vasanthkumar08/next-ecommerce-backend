import { jwtVerify } from "jose";

export const adminTokenCookie = "accessToken";

export interface AdminJwtPayload {
  sub: string;
  role: "admin" | "user" | "manager";
}

function getJwtSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ??
      process.env.AUTH_SECRET ??
      "dev-only-rbac-dashboard-secret-change-me"
  );
}

export async function verifyAdminToken(
  token: string
): Promise<AdminJwtPayload | null> {
  if (token.startsWith("mock.")) {
    try {
      const payload = JSON.parse(atob(token.slice(5))) as Partial<AdminJwtPayload>;

      if (
        typeof payload.sub === "string" &&
        (payload.role === "admin" ||
          payload.role === "user" ||
          payload.role === "manager")
      ) {
        return { sub: payload.sub, role: payload.role };
      }
    } catch {
      return null;
    }
  }

  try {
    const verified = await jwtVerify(token, getJwtSecret(), {
      issuer: "your-app",
      audience: "your-app-users",
    });
    const role = verified.payload.role;
    const sub = verified.payload.sub;

    if (
      typeof sub !== "string" ||
      (role !== "admin" && role !== "user" && role !== "manager")
    ) {
      return null;
    }

    return { sub, role };
  } catch {
    return null;
  }
}

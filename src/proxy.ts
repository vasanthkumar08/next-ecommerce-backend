import { adminTokenCookie, verifyAdminToken } from "@/lib/admin/jwt";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/unauthorized"];
const accessTokenMaxAge = 15 * 60;

interface RefreshResponse {
  success: boolean;
  accessToken: string;
  user: {
    role: "admin" | "user" | "manager";
  };
}

function getCookieValue(cookieHeader: string, name: string) {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")[1];
}

async function refreshSession(cookieHeader: string, nextUrl: URL) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const refreshToken = getCookieValue(cookieHeader, "refreshToken");

  if (!apiUrl || !refreshToken) {
    return null;
  }

  try {
    const refreshResponse = await fetch(`${apiUrl}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: `refreshToken=${refreshToken}`,
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const body = (await refreshResponse.json()) as RefreshResponse;
    const session = await verifyAdminToken(body.accessToken);

    if (!body.success || !session) {
      return null;
    }

    const response = NextResponse.next();
    response.cookies.set(adminTokenCookie, body.accessToken, {
      path: "/",
      maxAge: accessTokenMaxAge,
      sameSite: "lax",
      secure: nextUrl.protocol === "https:",
    });

    const rotatedRefreshCookie = refreshResponse.headers.get("set-cookie");
    if (rotatedRefreshCookie) {
      response.headers.append("set-cookie", rotatedRefreshCookie);
    }

    return { session, response };
  } catch {
    return null;
  }
}

export async function proxy(request: Request) {
  const nextUrl = new URL(request.url);
  const pathname = nextUrl.pathname;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = getCookieValue(cookieHeader, adminTokenCookie);
  const verifiedSession = token ? await verifyAdminToken(decodeURIComponent(token)) : null;
  const refreshed = verifiedSession ? null : await refreshSession(cookieHeader, nextUrl);
  const session = verifiedSession ?? refreshed?.session ?? null;
  const refreshedResponse = refreshed?.response ?? null;
  const isPublicRoute = publicRoutes.includes(pathname);

  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Edge RBAC is the first gate: unauthenticated users go to /login,
  // authenticated users with the wrong role go to /unauthorized.
  // Server pages still repeat checks with auth() so direct rendering,
  // prefetches, and future API actions stay protected too.
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    if (session.role !== "admin" && session.role !== "manager") {
      return NextResponse.redirect(new URL("/unauthorized", nextUrl));
    }
  }

  const userOnlyRoutes = ["/cart", "/checkout", "/profile", "/shop/cart", "/shop/checkout"];
  if (userOnlyRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  return refreshedResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/profile/:path*",
    "/shop/cart/:path*",
    "/shop/checkout/:path*",
  ],
};

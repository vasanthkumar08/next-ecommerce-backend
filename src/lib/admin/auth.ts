import { cookies } from "next/headers";
import { adminTokenCookie, verifyAdminToken } from "@/lib/admin/jwt";

export async function getAdminSession() {
  const token = (await cookies()).get(adminTokenCookie)?.value;

  if (!token) {
    return null;
  }

  return verifyAdminToken(token);
}

export { adminTokenCookie, verifyAdminToken };

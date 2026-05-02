import { getAdminSession } from "@/lib/admin/auth";
import { AdminShellClient } from "@/components/admin/AdminShellClient";

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <AdminShellClient
      user={{
        name: session?.role === "manager" ? "Manager" : "Admin",
        email: session?.sub ?? "admin",
        role: session?.role ?? "user",
      }}
    >
      {children}
    </AdminShellClient>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasRole } from "@/lib/rbac";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasRole(session.user.role, ["admin", "manager"])) {
    redirect("/unauthorized");
  }

  return <AdminShell>{children}</AdminShell>;
}

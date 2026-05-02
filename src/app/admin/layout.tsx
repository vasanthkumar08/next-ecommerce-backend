import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin" && session.role !== "manager") {
    redirect("/unauthorized");
  }

  return <AdminShell>{children}</AdminShell>;
}

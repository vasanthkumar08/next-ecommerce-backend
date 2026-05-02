import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { UnifiedLoginForm } from "@/components/auth/UnifiedLoginForm";

export default async function LoginPage() {
  const session = await getAdminSession();

  if (session?.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (session?.role === "user") {
    redirect("/shop");
  }

  return <UnifiedLoginForm />;
}

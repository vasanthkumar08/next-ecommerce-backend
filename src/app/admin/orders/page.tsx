import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { getAdminSession } from "@/lib/admin/auth";

export default async function AdminOrdersPage() {
  const session = await getAdminSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review every order, update status, and keep fulfillment readable at scale.
        </p>
      </div>
      <AdminOrdersClient canManage={session?.role === "admin"} />
    </div>
  );
}

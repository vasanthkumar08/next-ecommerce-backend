import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Store health, revenue, orders, users, and product signals in one clear view.
        </p>
      </div>
      <AdminDashboardClient />
    </div>
  );
}

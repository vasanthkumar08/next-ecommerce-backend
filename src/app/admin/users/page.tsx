import { AdminUsersClient } from "@/components/admin/AdminUsersClient";

export default async function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search customers, update roles, and block or unblock risky accounts.
        </p>
      </div>
      <AdminUsersClient />
    </div>
  );
}

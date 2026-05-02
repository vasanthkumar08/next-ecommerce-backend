import { rolePermissions } from "@/lib/rbac";
import { roleRows } from "@/lib/admin/data";
import { Badge } from "@/components/ui/Badge";

export default async function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">Roles and permissions</h1>
        <p className="mt-1 text-sm text-slate-500">
          Roles are extendable, while permissions keep resource actions explicit.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {roleRows.map((row) => (
          <section key={row.role} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold capitalize text-slate-950">{row.role}</h2>
            <p className="mt-3 text-sm text-slate-500">{row.scope}</p>
            <div className="mt-4 flex gap-2">
              <Badge variant="secondary">{row.users} users</Badge>
              <Badge variant="outline">{row.permissions} permissions</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {rolePermissions[row.role].map((permission) => (
                <Badge key={permission} variant="gray">
                  {permission}
                </Badge>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

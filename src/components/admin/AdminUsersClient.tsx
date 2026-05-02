"use client";

import { useEffect, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { setAdminUserBlocked, setAdminUserRole } from "@/features/admin/admin.api";
import { loadAdminUsers } from "@/features/admin/adminUserSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Role } from "@/types/rbac";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";

const tableHeadClass =
  "bg-[#F8FAFC] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500";
const tableCellClass = "px-4 py-4 align-middle text-sm text-slate-700";

export function AdminUsersClient() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.adminUsers);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void dispatch(loadAdminUsers({ page, search, limit: 10 }));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [dispatch, page, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const users = data?.users ?? [];
  const totalPages = Math.max(data?.pages ?? 1, 1);

  function toggleBlock(id: string, blocked: boolean) {
    startTransition(async () => {
      try {
        await setAdminUserBlocked(id, !blocked);
        toast.success(blocked ? "Success: user unblocked" : "Success: user blocked");
        void dispatch(loadAdminUsers({ page, search, limit: 10 }));
      } catch {
        toast.error("Failed: user status could not be updated");
      }
    });
  }

  function changeRole(id: string, role: Role) {
    startTransition(async () => {
      try {
        await setAdminUserRole(id, role);
        toast.success("Success: role updated");
        void dispatch(loadAdminUsers({ page, search, limit: 10 }));
      } catch {
        toast.error("Failed: role could not be updated");
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-950">All users</h2>
          <p className="mt-1 text-sm text-slate-500">Paginated user management with role and access controls.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users"
            className="rounded-lg border-slate-200 bg-white pl-9 text-black placeholder:text-slate-400 focus-visible:ring-[#2563EB]"
          />
        </div>
      </div>

      {error ? (
        <div className="m-5 rounded-xl border border-red-200 bg-white p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className={tableHeadClass}>Name</th>
                <th className={tableHeadClass}>Email</th>
                <th className={tableHeadClass}>Role</th>
                <th className={tableHeadClass}>Status</th>
                <th className={`${tableHeadClass} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id} className="transition hover:bg-[#F8FAFC]">
                  <td className={`${tableCellClass} font-semibold text-slate-950`}>{user.name}</td>
                  <td className={tableCellClass}>{user.email}</td>
                  <td className={tableCellClass}>
                    <select
                      value={user.role}
                      onChange={(event) => changeRole(user._id, event.target.value as Role)}
                      disabled={isPending}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-black outline-none transition focus:ring-2 focus:ring-[#2563EB] disabled:opacity-60"
                    >
                      <option value="admin">admin</option>
                      <option value="user">user</option>
                      <option value="manager">manager</option>
                    </select>
                  </td>
                  <td className={tableCellClass}>
                    <Badge variant={user.isBlocked ? "danger" : "success"}>
                      {user.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </td>
                  <td className={`${tableCellClass} text-right`}>
                    <Button
                      size="sm"
                      variant={user.isBlocked ? "outline" : "destructive"}
                      disabled={isPending}
                      onClick={() => toggleBlock(user._id, user.isBlocked)}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page {data?.page ?? page} of {totalPages} · {(data?.total ?? users.length).toLocaleString("en-IN")} users
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Download, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  loadAdminOrders,
  removeAdminOrderOptimistic,
} from "@/features/admin/adminOrderSlice";
import { deleteAdminOrder, updateAdminOrderStatus } from "@/features/admin/admin.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

const tableHeadClass =
  "bg-[#F8FAFC] px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500";
const tableCellClass = "px-4 py-4 align-middle text-sm text-slate-700";
const statuses = ["all", "pending", "delivered", "cancelled"] as const;
type StatusFilter = (typeof statuses)[number];

function getOrderBadgeVariant(status: string): BadgeVariant {
  const normalized = status.toLowerCase();
  if (normalized === "delivered" || normalized === "completed") return "success";
  if (normalized === "cancelled") return "danger";
  return "warning";
}

function getDisplayStatus(status: string, isDelivered: boolean) {
  if (isDelivered || status === "completed") return "Delivered";
  if (status === "cancelled") return "Cancelled";
  return "Pending";
}

function getCustomer(user: unknown) {
  if (typeof user === "object" && user !== null && "name" in user) {
    const candidate = user as { name?: string; email?: string };
    return candidate.name ?? candidate.email ?? "Customer";
  }

  return "Customer";
}

export function AdminOrdersClient({ canManage = true }: { canManage?: boolean }) {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.adminOrders);
  const [page, setPage] = useState(1);
  const [status, setStatusFilter] = useState<StatusFilter>("all");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void dispatch(loadAdminOrders({ page, limit: 10, status: status === "all" ? undefined : status }));
  }, [dispatch, page, status]);

  const orders = data?.orders ?? [];
  const totalPages = Math.max(data?.pages ?? 1, 1);

  function setStatus(id: string, nextStatus: "pending" | "delivered" | "cancelled") {
    if (!canManage) return;
    startTransition(async () => {
      try {
        await updateAdminOrderStatus(id, nextStatus);
        toast.success("Success: order status updated");
        void dispatch(loadAdminOrders({ page, limit: 10, status: status === "all" ? undefined : status }));
      } catch {
        toast.error("Failed: order status could not be updated");
      }
    });
  }

  function deleteOrder(id: string) {
    if (!canManage) return;
    dispatch(removeAdminOrderOptimistic(id));
    startTransition(async () => {
      try {
        await deleteAdminOrder(id);
        toast.success("Success: delivered order deleted");
      } catch {
        toast.error("Failed: order could not be deleted");
        void dispatch(loadAdminOrders({ page, limit: 10, status: status === "all" ? undefined : status }));
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-base font-bold text-slate-950">All orders</h2>
          <p className="mt-1 text-sm text-slate-500">Paginated fulfillment queue with clear status controls.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={status}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-black outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/admin/orders/export.csv`;
            }}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
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
          <table className="w-full min-w-[960px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className={tableHeadClass}>Order</th>
                <th className={tableHeadClass}>Customer</th>
                <th className={tableHeadClass}>Total</th>
                <th className={tableHeadClass}>Status</th>
                <th className={tableHeadClass}>Paid</th>
                <th className={`${tableHeadClass} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const orderId = order.id ?? order._id;
                const displayStatus = getDisplayStatus(order.status, order.isDelivered);

                return (
                  <tr key={orderId} className="transition hover:bg-[#F8FAFC]">
                    <td className={`${tableCellClass} font-semibold text-slate-950`}>{orderId}</td>
                    <td className={tableCellClass}>{getCustomer(order.user)}</td>
                    <td className={`${tableCellClass} font-semibold text-slate-950`}>₹{order.totalAmount.toLocaleString("en-IN")}</td>
                    <td className={tableCellClass}>
                      <Badge variant={getOrderBadgeVariant(displayStatus)}>{displayStatus}</Badge>
                    </td>
                    <td className={tableCellClass}>{order.isPaid ? "Yes" : "No"}</td>
                    <td className={`${tableCellClass} text-right`}>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" disabled={!canManage || isPending} onClick={() => setStatus(orderId, "pending")}>
                          <Truck className="h-4 w-4" />
                          Pending
                        </Button>
                        <Button size="sm" className="bg-[#2563EB] text-white hover:bg-blue-700" disabled={!canManage || isPending} onClick={() => setStatus(orderId, "delivered")}>
                          <CheckCircle2 className="h-4 w-4" />
                          Deliver
                        </Button>
                        <Button size="sm" variant="destructive" disabled={!canManage || isPending} onClick={() => setStatus(orderId, "cancelled")}>
                          <XCircle className="h-4 w-4" />
                          Cancel
                        </Button>
                        {order.isDelivered ? (
                          <Button size="sm" variant="outline" disabled={!canManage || isPending} onClick={() => deleteOrder(orderId)}>
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page {data?.page ?? page} of {totalPages} · {(data?.total ?? orders.length).toLocaleString("en-IN")} orders
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

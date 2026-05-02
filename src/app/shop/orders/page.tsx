"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  cancelOrderById,
  loadOrders,
  selectOrders,
  selectOrdersError,
  selectOrdersLoading,
} from "@/features/orders/ordersSlice";
import Link from "next/link";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import type { BadgeVariant } from "@/components/ui/Badge";

// Map order status → badge colour
const STATUS_BADGE: Record<string, BadgeVariant> = {
  Pending:    "gray",
  Processing: "orange",
  Shipped:    "blue",
  Delivered:  "green",
  Cancelled:  "red",
};

// Map order status → progress step (0-3)
const STATUS_STEP: Record<string, number> = {
  Pending: 0, Processing: 1, Shipped: 2, Delivered: 3,
};

const STEPS = ["Ordered", "Processing", "Shipped", "Delivered"];

function OrderTimeline({ status }: { status: string }) {
  const step = STATUS_STEP[status] ?? 0;
  return (
    <div className="mt-4 flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done    = i <= step;
        const current = i === step;
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* Connector line before */}
              {i > 0 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    i <= step ? "bg-[#16a34a]" : "bg-[#e0e0e0]"
                  }`}
                />
              )}
              {/* Dot */}
              <div
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors",
                  done
                    ? "border-[#16a34a] bg-[#16a34a] text-white"
                    : "border-[#e0e0e0] bg-white text-[#999]",
                  current ? "ring-2 ring-[#16a34a]/30" : "",
                ].join(" ")}
              >
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {/* Connector line after */}
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 transition-colors ${
                    i < step ? "bg-[#16a34a]" : "bg-[#e0e0e0]"
                  }`}
                />
              )}
            </div>
            <span
              className={`mt-1.5 text-[10px] font-medium ${
                done ? "text-[#16a34a]" : "text-[#999]"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersHistoryPage() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const loading = useAppSelector(selectOrdersLoading);
  const error = useAppSelector(selectOrdersError);
  const userId = useAppSelector((state) => state.auth.user?.id);

  useEffect(() => {
    void dispatch(loadOrders(userId));
  }, [dispatch, userId]);

  const handleCancel = async (orderId: string, isDelivered?: boolean) => {
    if (isDelivered) {
      toast.error("Failed");
      return;
    }

    const result = await dispatch(cancelOrderById(orderId));

    if (cancelOrderById.fulfilled.match(result)) {
      toast.success("Success");
      return;
    }

    toast.error("Failed");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#111111]">Order History</h1>
          <p className="mt-1 text-sm text-[#666666]">
            {orders.length > 0
              ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`
              : "Track and manage your orders"}
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-[#e0e0e0] bg-white shadow-sm"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white py-24 text-center shadow-sm">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f5f5]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-[#111111]">
              No orders yet
            </h2>
            <p className="mb-6 max-w-xs text-sm text-[#666666]">
              When you place your first order, it will appear here.
            </p>
            <Link
              href="/shop/products"
              className="rounded-xl bg-[#ff9900] px-8 py-3 font-semibold text-white transition hover:bg-[#e88a00]"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Order list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const badgeVariant: BadgeVariant =
                STATUS_BADGE[order.status] ?? "gray";
              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-[#e0e0e0] bg-white shadow-sm"
                >
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] bg-[#f5f5f5] px-5 py-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">
                          Order ID
                        </p>
                        <p className="font-mono font-bold text-[#111111]">
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">
                          Placed
                        </p>
                        <p className="font-medium text-[#111111]">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#666666]">
                          Total
                        </p>
                        <p className="font-bold text-[#111111]">
                          ₹{order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={badgeVariant} dot>
                      {order.status}
                    </Badge>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-[#e0e0e0] px-5">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#111111]">
                            {item.title}
                          </p>
                          <p className="text-xs text-[#666666]">
                            Qty: {item.quantity} ×{" "}
                            ₹{item.price.toFixed(2)}
                          </p>
                        </div>
                        <p className="ml-4 shrink-0 font-semibold text-[#111111]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-[#e0e0e0] px-5 pb-5 pt-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#666666]">
                      Tracking
                    </p>
                    <OrderTimeline status={order.status} />
                    <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {order.isDelivered || order.status === "Delivered" ? (
                        <p className="text-sm font-semibold text-[#666666]">
                          Order already delivered
                        </p>
                      ) : (
                        <p className="text-sm text-[#666666]">
                          You can cancel this order before delivery.
                        </p>
                      )}
                      <button
                        type="button"
                        disabled={order.isDelivered || order.status === "Delivered"}
                        onClick={() => void handleCancel(order.id, order.isDelivered || order.status === "Delivered")}
                        className="inline-flex h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-[#e0e0e0] disabled:text-[#999999] disabled:hover:bg-white"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

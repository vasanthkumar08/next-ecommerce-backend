"use client";

import { useEffect } from "react";
import { Activity, IndianRupee, Package, ShoppingCart, Users } from "lucide-react";
import { loadDashboardStats } from "@/features/admin/dashboardSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import {
  CategoryPieChart,
  OrdersLineChart,
  RevenueBarChart,
} from "@/components/dashboard/RevenueChart";

const adminCard = "rounded-xl border border-slate-200 bg-white p-5 shadow-sm";

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "completed") return "Delivered";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function AdminDashboardClient() {
  const dispatch = useAppDispatch();
  const { data, loading, error } = useAppSelector((state) => state.adminDashboard);

  useEffect(() => {
    void dispatch(loadDashboardStats());
  }, [dispatch]);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl bg-slate-100" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-4 text-sm font-medium text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: "Total Users",
      value: data.users.totalUsers.toLocaleString("en-IN"),
      helper: `${data.users.newUsers.toLocaleString("en-IN")} new in 30 days`,
      icon: Users,
    },
    {
      label: "Total Orders",
      value: data.orders.totalOrders.toLocaleString("en-IN"),
      helper: `${data.orders.pendingOrders.toLocaleString("en-IN")} pending review`,
      icon: ShoppingCart,
    },
    {
      label: "Total Products",
      value: data.products.totalProducts.toLocaleString("en-IN"),
      helper: `${data.products.lowStockProducts.toLocaleString("en-IN")} low-stock SKUs`,
      icon: Package,
    },
    {
      label: "Total Revenue",
      value: formatCurrency(data.revenue.totalRevenue),
      helper: `AOV ${formatCurrency(data.revenue.avgOrderValue)}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <section key={stat.label} className={adminCard}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                  {stat.value}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#2563EB] ring-1 ring-slate-200">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
            <p className="mt-4 text-sm text-slate-500">{stat.helper}</p>
          </section>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <section className={`${adminCard} min-w-0`}>
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-950">Orders per day</h2>
            <p className="mt-1 text-sm text-slate-500">Daily order volume for the last 14 days.</p>
          </div>
          <OrdersLineChart data={data.charts.ordersPerDay} />
        </section>
        <section className={`${adminCard} min-w-0`}>
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-950">Revenue</h2>
            <p className="mt-1 text-sm text-slate-500">Delivered and completed order revenue.</p>
          </div>
          <RevenueBarChart data={data.charts.salesOverTime} />
        </section>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className={`${adminCard} min-w-0`}>
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-950">Product categories</h2>
            <p className="mt-1 text-sm text-slate-500">Live mix of active products from the database.</p>
          </div>
          <CategoryPieChart data={data.charts.productCategories} />
        </section>

        <section className={adminCard}>
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#2563EB]" />
            <h2 className="text-base font-bold text-slate-950">Recent orders</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">
                    {order.id} · {order.customer}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
                <Badge variant={order.status === "cancelled" ? "danger" : order.status === "pending" ? "warning" : "success"}>
                  {normalizeStatus(order.status)}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryChartPoint, ChartPoint } from "@/types/admin";

function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return mounted;
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="flex h-72 min-h-72 w-full min-w-0 items-center justify-center rounded-xl border border-slate-200 bg-[#F8FAFC] text-sm text-slate-500">
        Loading chart
      </div>
    );
  }

  return <div className="h-72 min-h-72 w-full min-w-0">{children}</div>;
}

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  color: "#0F172A",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
};

export function RevenueBarChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={288} minWidth={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={56} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F8FAFC" }} />
          <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function OrdersLineChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={288} minWidth={240}>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="4 4" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} width={40} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ r: 3, fill: "#38BDF8", strokeWidth: 0 }}
            activeDot={{ r: 6, fill: "#2563EB" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function CategoryPieChart({ data }: { data: CategoryChartPoint[] }) {
  const colors = ["#2563EB", "#38BDF8", "#93C5FD", "#BAE6FD", "#DBEAFE"];

  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height={288} minWidth={240}>
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={96}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  return <RevenueBarChart data={data} />;
}

export function OrdersChartContent({ data }: { data: ChartPoint[] }) {
  return <OrdersLineChart data={data} />;
}

export function OrdersChart() {
  return <OrdersLineChart data={[]} />;
}

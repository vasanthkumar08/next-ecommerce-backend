"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useState } from "react";

const items = ["Order alerts", "Deals and coupons", "Price drops", "Wishlist reminders"] as const;

export default function NotificationSettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    "Order alerts": true,
    "Deals and coupons": true,
    "Price drops": false,
    "Wishlist reminders": true,
  });

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
          <Bell className="h-7 w-7 text-[#ff6700]" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Notifications
          </h1>
          <div className="mt-6 space-y-3">
            {items.map((item) => (
              <label
                key={item}
                className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4"
              >
                <span className="font-bold text-slate-700">{item}</span>
                <button
                  type="button"
                  onClick={() =>
                    setEnabled((prev) => ({ ...prev, [item]: !prev[item] }))
                  }
                  className={`relative h-7 w-12 rounded-full transition ${
                    enabled[item] ? "bg-[#ff6700]" : "bg-slate-200"
                  }`}
                  aria-pressed={enabled[item]}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                      enabled[item] ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
          <Link
            href="/settings"
            className="mt-6 inline-flex rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700 transition hover:border-[#ff6700] hover:text-[#ff6700]"
          >
            Back to Settings
          </Link>
        </section>
      </div>
    </main>
  );
}

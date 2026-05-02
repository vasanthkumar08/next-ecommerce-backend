"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ChevronRight,
  KeyRound,
  MapPin,
  MonitorSmartphone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

const cards = [
  {
    icon: User,
    title: "Account Info",
    description: "Name, email, mobile number and login security.",
    href: "/settings/account",
  },
  {
    icon: MapPin,
    title: "Saved Addresses",
    description: "Manage home, work and billing delivery addresses.",
    href: "/settings/addresses",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Order alerts, deals, price drops and wishlist updates.",
    href: "/settings/notifications",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Security",
    description: "Sessions, password reset and secure checkout preferences.",
    href: "/settings/security",
  },
] as const;

const notificationItems = [
  "Order alerts",
  "Deals and coupons",
  "Price drops",
  "Wishlist reminders",
] as const;

export default function SettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    "Order alerts": true,
    "Deals and coupons": true,
    "Price drops": false,
    "Wishlist reminders": true,
  });

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6700]">
                Account center
              </p>
              <h1 className="mt-2 text-3xl font-black text-slate-950">
                Settings
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                Manage profile, addresses, notifications and security for your
                vasanthtrends shopping account.
              </p>
            </div>
            <Link
              href="/profile"
              className="rounded-2xl bg-[#ff6700] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
            >
              Back to Profile
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ icon: Icon, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md active:scale-[0.99]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#ff6700] transition group-hover:bg-[#ff6700] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-black text-slate-950">
                      {title}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#ff6700]" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <section
            id="account"
            className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6"
          >
            <h2 className="text-xl font-black text-slate-950">
              Account Info
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <input
                defaultValue="K. Vasanth"
                className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#ff6700] focus:ring-2 focus:ring-orange-500/15"
              />
              <input
                defaultValue="+91 98765 43210"
                className="h-12 rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#ff6700] focus:ring-2 focus:ring-orange-500/15"
              />
              <input
                defaultValue="vasanth@example.com"
                readOnly
                className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-500 outline-none md:col-span-2"
              />
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff6700] px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95 md:col-span-2">
                <Save className="h-4 w-4" />
                Save Account Info
              </button>
            </div>
          </section>

          <section
            id="addresses"
            className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6"
          >
            <h2 className="text-xl font-black text-slate-950">
              Saved Addresses
            </h2>
            <div className="mt-5 space-y-3">
              {["Home", "Work"].map((label) => (
                <div
                  key={label}
                  className="rounded-3xl border border-slate-200 bg-white p-4"
                >
                  <p className="font-black text-slate-950">{label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    12, Anna Nagar Main Road, Chennai, Tamil Nadu - 600040
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1fr]">
          <section
            id="notifications"
            className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6"
          >
            <h2 className="text-xl font-black text-slate-950">
              Notifications
            </h2>
            <div className="mt-5 space-y-3">
              {notificationItems.map((item) => (
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
          </section>

          <section
            id="security"
            className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6"
          >
            <h2 className="text-xl font-black text-slate-950">
              Privacy & Security
            </h2>
            <div className="mt-5 grid gap-3">
              {[
                {
                  icon: MonitorSmartphone,
                  title: "Active sessions",
                  body: "This device • Chrome on Windows • Active now",
                },
                {
                  icon: KeyRound,
                  title: "Password reset",
                  body: "Send a secure password reset link to your email.",
                },
                {
                  icon: ShieldCheck,
                  title: "Secure checkout",
                  body: "Razorpay and COD payment checks are enabled.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-slate-200 bg-white p-4"
                >
                  <Icon className="h-5 w-5 text-[#ff6700]" />
                  <p className="mt-3 font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

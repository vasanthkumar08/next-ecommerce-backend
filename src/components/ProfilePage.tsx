"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Camera,
  Heart,
  KeyRound,
  MapPin,
  Package,
  Save,
  Settings,
  ShieldCheck,
  ShoppingBag,
  User,
  WalletCards,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";

const avatarUrl =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=85";

const recentOrders = [
  {
    id: "VT-10241",
    title: "Premium dry fruit gift box",
    date: "28 Apr 2026",
    status: "Delivered",
    total: "₹1,499",
  },
  {
    id: "VT-10202",
    title: "Wireless headphones",
    date: "21 Apr 2026",
    status: "Shipped",
    total: "₹2,299",
  },
  {
    id: "VT-10188",
    title: "Kitchen glass container set",
    date: "16 Apr 2026",
    status: "Processing",
    total: "₹899",
  },
] as const;

const sidebarLinks = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Orders", href: "/shop/orders", icon: Package },
  { label: "Wishlist", href: "/shop/wishlist", icon: Heart },
  { label: "Addresses", href: "/settings#addresses", icon: MapPin },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const orders = useAppSelector((state) => state.orders.items);

  const fallbackUser = useMemo(
    () => ({
      name: "K. Vasanth",
      email: "vasanth@example.com",
      phone: "+91 98765 43210",
      joinedAt: "January 2026",
    }),
    []
  );

  const [name, setName] = useState(authUser?.name ?? fallbackUser.name);
  const [phone, setPhone] = useState(fallbackUser.phone);

  const stats = [
    {
      label: "Total Orders",
      value: Math.max(orders.length, 12).toString(),
      icon: ShoppingBag,
    },
    {
      label: "Wishlist Items",
      value: Math.max(wishlistCount, 8).toString(),
      icon: Heart,
    },
    {
      label: "Total Spent",
      value: "₹42,580",
      icon: WalletCards,
    },
  ] as const;

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-white/70 bg-white/90 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-3xl bg-orange-50 p-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full">
                <Image
                  src={avatarUrl}
                  alt="K. Vasanth profile avatar"
                  fill
                  sizes="56px"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-black text-slate-950">
                  {authUser?.name ?? fallbackUser.name}
                </p>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {authUser?.email ?? fallbackUser.email}
                </p>
              </div>
            </div>

            <nav className="mt-4 space-y-1">
              {sidebarLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#ff6700]"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>

            <button
              onClick={() => dispatch(logout())}
              className="mt-4 w-full rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 active:scale-95"
            >
              Sign out
            </button>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl">
                  <Image
                    src={avatarUrl}
                    alt="K. Vasanth avatar"
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                  <button
                    className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6700] text-white shadow-lg transition hover:bg-[#f05f00]"
                    aria-label="Edit avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#ff6700]">
                    My Profile
                  </p>
                  <h1 className="mt-2 text-3xl font-black text-slate-950">
                    {authUser?.name ?? fallbackUser.name}
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Joined {fallbackUser.joinedAt} • Prime-style member benefits
                    active
                  </p>
                </div>

                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
                  <ShieldCheck className="mb-2 h-5 w-5" />
                  Secure checkout enabled
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-3xl border border-white/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <Icon className="h-6 w-6 text-[#ff6700]" />
                  <p className="mt-4 text-3xl font-black text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
              <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
                <h2 className="text-xl font-black text-slate-950">
                  Edit Profile
                </h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Name
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#ff6700] focus:ring-2 focus:ring-orange-500/15"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Phone
                    <input
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#ff6700] focus:ring-2 focus:ring-orange-500/15"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-bold text-slate-700 md:col-span-2">
                    Email
                    <input
                      value={authUser?.email ?? fallbackUser.email}
                      readOnly
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-500 outline-none"
                    />
                  </label>
                  <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#ff6700] px-5 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95 md:col-span-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </section>

              <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
                <h2 className="flex items-center gap-2 text-xl font-black text-slate-950">
                  <KeyRound className="h-5 w-5 text-[#ff6700]" />
                  Change Password
                </h2>
                <div className="mt-5 grid gap-4">
                  {["Current password", "New password", "Confirm password"].map(
                    (label) => (
                      <label
                        key={label}
                        className="grid gap-2 text-sm font-bold text-slate-700"
                      >
                        {label}
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#ff6700] focus:ring-2 focus:ring-orange-500/15"
                        />
                      </label>
                    )
                  )}
                  <button className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-[#ff6700] hover:text-[#ff6700] active:scale-95">
                    Update Password
                  </button>
                </div>
              </section>
            </div>

            <section className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    Recent Orders
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Quick preview of your latest purchases.
                  </p>
                </div>
                <Link
                  href="/shop/orders"
                  className="rounded-full bg-orange-50 px-4 py-2 text-sm font-black text-[#ff6700] transition hover:bg-[#ff6700] hover:text-white"
                >
                  View all
                </Link>
              </div>

              <div className="grid gap-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-black text-slate-950">
                        {order.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {order.id} • {order.date}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        {order.status}
                      </span>
                      <span className="font-black text-slate-950">
                        {order.total}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>
        </div>
      </div>
    </main>
  );
}

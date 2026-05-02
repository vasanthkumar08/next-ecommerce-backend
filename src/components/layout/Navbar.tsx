"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Gem,
  Heart,
  Home as HomeIcon,
  LogOut,
  Package,
  Search,
  Settings,
  Shirt,
  ShoppingBasket,
  ShoppingCart,
  Sparkles,
  Moon,
  Sun,
  Smartphone,
  Utensils,
  User,
  UserRound,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth/authSlice";

const categories = [
  { label: "All Products", href: "/shop/products", icon: Package },
  { label: "Electronics", href: "/shop/products?cat=electronics", icon: Smartphone },
  { label: "Fashion", href: "/shop/products?cat=fashion", icon: Shirt },
  { label: "Men", href: "/shop/products?cat=men%27s%20clothing", icon: User },
  { label: "Women", href: "/shop/products?cat=women%27s%20clothing", icon: UserRound },
  { label: "Jewelery", href: "/shop/products?cat=jewelery", icon: Gem },
  { label: "Grocery", href: "/shop/products?cat=grocery", icon: ShoppingBasket },
  { label: "Premium Dry Fruits", href: "/shop/products?cat=grocery", icon: Heart },
  { label: "Home", href: "/shop/products?cat=home", icon: HomeIcon },
  { label: "Kitchen", href: "/shop/products?cat=kitchen", icon: Utensils },
  { label: "Accessories", href: "/shop/products?cat=accessories", icon: Sparkles },
] as const;

export default function Navbar() {
  const dispatch = useAppDispatch();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const cartCount = useAppSelector((state) =>
    state.cart.items.reduce((a, i) => a + i.quantity, 0)
  );
  const wishlistCount = useAppSelector((state) => state.wishlist.items.length);
  const user = useAppSelector((state) => state.auth.user);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const isDark = themeMounted && resolvedTheme === "dark";

  return (
    <header
      className={`sticky top-0 z-50 w-full overflow-visible border-b border-slate-200 bg-white transition-shadow ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-lg font-black tracking-tight text-slate-800 sm:text-xl"
        >
          vasanth<span className="text-[#ff6700]">trends</span>
        </Link>

        <div className="hidden min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition focus-within:border-[#ff6700] focus-within:ring-2 focus-within:ring-orange-500/15 sm:flex">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, brands and more..."
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
          <Link
            href={`/shop/products?q=${encodeURIComponent(search)}`}
            className="flex w-12 items-center justify-center bg-[#ff6700] text-white transition hover:bg-[#f05f00]"
            aria-label="Search products"
          >
            <Search className="h-4 w-4" />
          </Link>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 text-slate-800">
          <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#ff6700] hover:text-[#ff6700]"
            aria-label="Switch theme appearance"
            title={isDark ? "Light theme" : "Dark theme"}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link
            href="/shop/wishlist"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#ff6700] hover:text-[#ff6700] sm:flex"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6700] px-1 text-[10px] font-black text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            href="/shop/cart"
            data-cart-target="primary"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-[#ff6700] hover:text-[#ff6700]"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff6700] px-1 text-[10px] font-black text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setProfileOpen((open) => !open)}
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 text-sm font-black transition hover:-translate-y-0.5 hover:border-[#ff6700] hover:text-[#ff6700] sm:px-3"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6700] text-xs text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-24 truncate sm:block">
                  Hi, {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-64 overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
                >
                  <div className="border-b border-slate-100 p-3">
                    <p className="font-black text-slate-800">{user.name}</p>
                    <p className="truncate text-xs font-semibold text-slate-500">
                      {user.email}
                    </p>
                  </div>
                  {[
                    { label: "Profile", href: "/profile", icon: User },
                    { label: "Orders", href: "/shop/orders", icon: Package },
                    { label: "Wishlist", href: "/shop/wishlist", icon: Heart },
                    { label: "Settings", href: "/settings", icon: Settings },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-[#ff6700]"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      dispatch(logout());
                      setProfileOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-2xl border border-[#ff6700] px-4 py-2 text-sm font-black text-[#ff6700] transition hover:bg-[#ff6700] hover:text-white sm:block"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      <div className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-hidden px-4 py-2 text-sm font-bold text-slate-700 sm:px-6 lg:px-8">
          {categories.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-transparent text-slate-700 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-white hover:text-[#ff6700] hover:shadow-sm active:scale-95"
              aria-label={label}
              title={label}
            >
              <Icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

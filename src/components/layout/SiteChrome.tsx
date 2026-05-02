"use client";

import { usePathname } from "next/navigation";
import HydrateCart from "@/components/HydrateCart";
import PersistCart from "@/components/PersistCart";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import CartDrawer from "@/components/cart/CartDrawer";
import { ToastProvider } from "@/context/ToastContext";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWorkspace =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/unauthorized");

  if (isWorkspace) {
    return <>{children}</>;
  }

  return (
    <ToastProvider>
      <Navbar />
      <HydrateCart>
        <main className="pb-24 md:pb-0">{children}</main>
      </HydrateCart>
      <PersistCart />
      <CartDrawer />
      <Footer />
      <MobileBottomNav />
    </ToastProvider>
  );
}

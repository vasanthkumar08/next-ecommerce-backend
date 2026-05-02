"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IndianRupee, ShoppingCart, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import type { Product } from "@/types/product";
import { CART_DRAWER_EVENT } from "@/utils/cartDrawerEvents";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [recentProduct, setRecentProduct] = useState<Product | null>(null);
  const cartItems = useAppSelector((state) => state.cart.items);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Math.max(1, Math.round(item.price)) * item.quantity,
        0
      ),
    [cartItems]
  );

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<Product | undefined>).detail;
      setRecentProduct(detail ?? null);
      setOpen(true);
    };

    window.addEventListener(CART_DRAWER_EVENT, onOpen);
    return () => window.removeEventListener(CART_DRAWER_EVENT, onOpen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close cart drawer"
            className="fixed inset-0 z-[85] bg-slate-950/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Cart summary"
            className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-md flex-col border-l border-orange-100 bg-white shadow-[-24px_0_70px_rgba(15,23,42,0.18)] sm:rounded-l-3xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#ff6700]">
                  Cart updated
                </p>
                <h2 className="mt-1 text-lg font-black text-slate-800">
                  {cartCount} item{cartCount === 1 ? "" : "s"} in your cart
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#ff6700] hover:text-[#ff6700]"
                aria-label="Close cart drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {recentProduct ? (
                <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
                  <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#ff6700]">
                    Recently added
                  </p>
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                      <Image
                        src={recentProduct.image || "/placeholder.png"}
                        alt={recentProduct.title}
                        fill
                        sizes="64px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold text-slate-800">
                        {recentProduct.title}
                      </p>
                      <p className="mt-1 flex items-center text-sm font-black text-slate-700">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {currency.format(Math.max(1, Math.round(recentProduct.price))).replace("₹", "")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                {cartItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.title}
                        fill
                        sizes="56px"
                        className="object-contain p-1.5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-slate-800">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <p className="flex shrink-0 items-center text-sm font-black text-slate-700">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {currency.format(Math.max(1, Math.round(item.price)) * item.quantity).replace("₹", "")}
                    </p>
                  </div>
                ))}
              </div>

              {cartItems.length === 0 ? (
                <div className="mt-12 text-center">
                  <ShoppingCart className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-bold text-slate-700">
                    Your cart is empty
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-100 p-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-500">
                  Subtotal
                </span>
                <span className="flex items-center text-xl font-black text-slate-800">
                  <IndianRupee className="h-5 w-5" />
                  {currency.format(subtotal).replace("₹", "")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/shop/cart"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-orange-200 bg-white text-sm font-black text-[#ff6700] transition hover:bg-orange-50"
                >
                  View Cart
                </Link>
                <Link
                  href="/shop/checkout"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#ff6700] text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

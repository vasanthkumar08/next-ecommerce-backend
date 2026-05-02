"use client";

import type { Product } from "@/types/product";

export const CART_DRAWER_EVENT = "cart-drawer:open";

export const openCartDrawer = (product?: Product) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<Product | undefined>(CART_DRAWER_EVENT, {
      detail: product,
    })
  );
};

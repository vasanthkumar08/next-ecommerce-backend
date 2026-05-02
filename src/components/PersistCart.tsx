"use client";

import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { saveCart } from "@/features/cart/cartPersist";

export default function PersistCart() {
  const items = useAppSelector((state) => state.cart.items);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  return null;
}

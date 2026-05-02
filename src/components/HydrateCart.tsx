"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { hydrateCart } from "@/features/cart/cartSlice";
import { loadCart } from "@/features/cart/cartPersist";

export default function HydrateCart({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateCart(loadCart()));
  }, [dispatch]);

  return <>{children}</>;
}
import { CartItem } from "./cartSlice";

export const saveCart = (state: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cart", JSON.stringify(state));
};

export const loadCart = (): CartItem[] | undefined => {
  if (typeof window === "undefined") return undefined;
  const data = localStorage.getItem("cart");
  return data ? (JSON.parse(data) as CartItem[]) : undefined;
};
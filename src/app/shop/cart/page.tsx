"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart, decreaseQuantity, removeFromCart } from "@/features/cart/cartSlice";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_340px]">
      {/* LEFT — product list */}
      <div>
        <h1 className="mb-6 text-2xl font-bold text-[#111111]">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="rounded-xl border border-[#e0e0e0] bg-white p-12 text-center shadow-sm">
            <p className="mb-1 text-4xl">🛒</p>
            <p className="mb-4 text-[#666666]">Your cart is empty</p>
            <Link
              href="/shop/products"
              className="inline-block rounded-lg bg-[#ff9900] px-6 py-2 font-semibold text-white transition hover:bg-[#e88a00]"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-[#e0e0e0] bg-white p-4 shadow-sm"
              >
                <div className="relative h-24 w-24 shrink-0">
                  <Image
                    src={item.image || "/placeholder.png"}
                    alt={item.title}
                    fill
                    className="object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="line-clamp-2 font-semibold text-[#111111]">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-lg font-bold text-[#ff6700]">
                    ${item.price.toFixed(2)}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => dispatch(decreaseQuantity(item.id))}
                      className="h-7 w-7 rounded border border-[#e0e0e0] bg-[#f5f5f5] text-sm font-bold transition hover:bg-[#e0e0e0]"
                    >
                      −
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch(addToCart(item))}
                      className="h-7 w-7 rounded border border-[#e0e0e0] bg-[#f5f5f5] text-sm font-bold transition hover:bg-[#e0e0e0]"
                    >
                      +
                    </button>
                    <button
                      // ✅ FIX: was String(item.id) — now correctly number
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="ml-3 text-sm text-red-500 transition hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="shrink-0 font-bold text-[#111111]">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — order summary */}
      <aside className="h-fit rounded-xl border border-[#e0e0e0] bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="mb-4 text-lg font-bold text-[#111111]">
          Order Summary
        </h2>
        <div className="space-y-2 text-sm text-[#666666]">
          <div className="flex justify-between">
            <span>
              Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0)} items)
            </span>
            <span className="font-medium text-[#111111]">
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className="font-medium text-[#ff6700]">FREE</span>
          </div>
        </div>
        <div className="my-4 border-t border-[#e0e0e0]" />
        <div className="flex justify-between text-base font-bold text-[#111111]">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Link
          href="/shop/checkout"
          className="mt-4 block rounded-lg bg-[#ff9900] py-3 text-center font-semibold text-white transition hover:bg-[#e88a00]"
        >
          Proceed to Checkout
        </Link>
        <Link
          href="/shop/products"
          className="mt-2 block text-center text-sm text-[#ff6700] hover:underline"
        >
          Continue Shopping
        </Link>
      </aside>
    </div>
  );
}

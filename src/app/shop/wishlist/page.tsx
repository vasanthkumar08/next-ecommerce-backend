"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromWishlist } from "@/features/wishlist/wishlistSlice";
import { addToCart } from "@/features/cart/cartSlice";
import { useToastContext } from "@/context/ToastContext";
import Badge from "@/components/ui/Badge";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#dc2626" : "none"} stroke="#dc2626" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const toast = useToastContext();
  const items = useAppSelector((state) => state.wishlist.items);

  const handleRemove = (id: string) => {
    dispatch(removeFromWishlist(id));
    toast.info("Success");
  };

  const handleAddToCart = (product: (typeof items)[0]) => {
    dispatch(addToCart(product));
    toast.success("Success");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#111111]">My Wishlist</h1>
            <p className="mt-1 text-sm text-[#666666]">
              {items.length} saved item{items.length !== 1 ? "s" : ""}
            </p>
          </div>
          {items.length > 0 && (
            <Link
              href="/shop/products"
              className="rounded-lg border border-[#ff6700] px-4 py-2 text-sm font-medium text-[#ff6700] transition hover:bg-[#ff6700] hover:text-white"
            >
              Continue Shopping
            </Link>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white py-24 text-center shadow-sm">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-[#111111]">
              Your wishlist is empty
            </h2>
            <p className="mb-6 max-w-sm text-sm text-[#666666]">
              Save items you love by clicking the heart icon on any product.
            </p>
            <Link
              href="/shop/products"
              className="rounded-xl bg-[#ff9900] px-8 py-3 font-semibold text-white transition hover:bg-[#e88a00]"
            >
              Explore Products
            </Link>
          </div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((product) => (
              <div
                key={product.id}
                className="group relative flex flex-col rounded-2xl border border-[#e0e0e0] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#e0e0e0] bg-white shadow-sm transition hover:scale-110 hover:border-red-200 hover:bg-red-50"
                >
                  <HeartIcon filled />
                </button>

                {/* Image */}
                <Link href={`/shop/products/${product.id}`} className="block">
                  <div className="relative mx-4 mt-4 h-44 overflow-hidden rounded-xl bg-[#f5f5f5]">
                    <Image
                      src={product.image || "/placeholder.png"}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <Badge variant="gray" className="mb-2 self-start capitalize">
                    {product.category}
                  </Badge>

                  <Link href={`/shop/products/${product.id}`}>
                    <h3 className="line-clamp-2 text-sm font-semibold text-[#111111] transition hover:text-[#ff6700]">
                      {product.title}
                    </h3>
                  </Link>

                  <p className="mt-2 text-base font-bold text-[#111111]">
                    ${Number(product.price).toFixed(2)}
                  </p>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-3 w-full rounded-lg bg-[#ff9900] py-2 text-sm font-semibold text-white transition hover:bg-[#e88a00] active:scale-[.98]"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

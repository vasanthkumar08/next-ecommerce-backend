"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgePercent,
  Heart,
  IndianRupee,
  ShieldCheck,
  ShoppingCart,
  Eye,
  X,
  Star,
  Truck,
  Zap,
} from "lucide-react";

export interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  rating: number;
  reviewCount: number;
  category: string;
  description?: string;
  href?: string;
  wishlisted?: boolean;
  onAddToCart?: (trigger?: HTMLElement | null) => void;
  onToggleWishlist?: () => void;
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function ProductCard({
  id,
  name,
  price,
  originalPrice,
  discount,
  image,
  rating,
  reviewCount,
  category,
  description = "",
  href = `/shop/products/${id}`,
  wishlisted = false,
  onAddToCart,
  onToggleWishlist,
}: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const imageSrc = imageFailed || !image.trim() ? "/placeholder.png" : image;
  const isLimitedDeal = discount > 30;
  const cleanDescription =
    description.trim() || "Premium quality product selected for everyday use.";
  const closeQuickView = () => {
    setQuickViewOpen(false);
    setTouchStartY(null);
    setTouchOffset(0);
  };

  return (
    <>
    <motion.article
      data-product-scope
      layout
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 hover:border-orange-200 hover:shadow-md"
    >
      <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#cc0c39] px-2.5 py-1 text-[11px] font-black text-white shadow-lg shadow-red-500/20">
        <BadgePercent className="h-3.5 w-3.5" />
        {discount}% off
      </div>

      <button
        type="button"
        onClick={onToggleWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:scale-110 hover:text-[#cc0c39] active:scale-95"
      >
        <Heart
          className={`h-5 w-5 transition ${
            wishlisted
              ? "fill-[#cc0c39] stroke-[#cc0c39]"
              : "group-hover:fill-[#cc0c39]/10"
          }`}
        />
      </button>

      <div
        data-fly-image
        className="relative mx-3 mt-3 aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-white"
      >
        <Link href={href} className="block h-full">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loading="eager"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition duration-500 group-hover:scale-110"
            onError={() => setImageFailed(true)}
          />
        </Link>
        <button
          type="button"
          onClick={() => setQuickViewOpen(true)}
          className="absolute bottom-3 left-3 right-3 inline-flex h-10 translate-y-3 items-center justify-center gap-2 rounded-xl bg-white px-3 text-sm font-black text-slate-950 opacity-0 shadow-sm transition duration-300 hover:bg-[#ff6700] hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
        >
          <Eye className="h-4 w-4" />
          Quick View
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="mb-2 flex min-h-7 flex-wrap items-center gap-2">
          {isLimitedDeal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[10px] font-black text-[#cc0c39] sm:text-[11px]">
              <Zap className="h-3 w-3 fill-[#cc0c39]" />
              Limited time deal
            </span>
          )}
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold capitalize text-slate-600 sm:text-[11px]">
            {category}
          </span>
        </div>

        <Link href={href}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-slate-800 transition hover:text-[#ff6700]">
            {name}
          </h3>
        </Link>

        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
          {cleanDescription}
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex text-[#ff9900]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-3.5 w-3.5 ${
                  index < Math.round(rating)
                    ? "fill-[#ff9900] stroke-[#ff9900]"
                    : "fill-slate-200 stroke-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-500">
            ({reviewCount.toLocaleString("en-IN")})
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-2">
          <p className="flex items-center text-lg font-black tracking-tight text-slate-800 sm:text-xl">
            <IndianRupee className="h-4 w-4" />
            {currency.format(price).replace("₹", "")}
          </p>
          <p className="pb-0.5 text-xs font-semibold text-slate-400 line-through">
            {currency.format(originalPrice)}
          </p>
        </div>

        <div className="mt-3 grid gap-1.5 text-[10px] font-semibold text-slate-500 sm:text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-[#ff6700]" />
            Free delivery by tomorrow
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            GST invoice available
          </span>
        </div>

        <button
          type="button"
          onClick={(event) => onAddToCart?.(event.currentTarget)}
          className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6700] px-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>

    </motion.article>

    {quickViewOpen ? (
      <>
        <div className="fixed inset-0 z-[80] hidden items-center justify-center bg-slate-950/60 p-4 animate-[quickViewFade_.18s_ease-out] md:flex">
          <div data-product-scope className="relative grid max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl animate-[quickViewZoom_.2s_ease-out] md:grid-cols-[1.05fr_.95fr]">
            <button
              type="button"
              aria-label="Close quick view"
              onClick={closeQuickView}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <div data-fly-image className="relative aspect-square min-h-[280px] bg-slate-100 md:min-h-[520px]">
              <Image
                src={imageSrc}
                alt={name}
                fill
                sizes="(min-width: 768px) 480px, 100vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col p-6 text-slate-800 sm:p-8">
              <span className="mb-3 w-fit rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-[#ff6700]">
                {category}
              </span>
              <h2 className="text-2xl font-black leading-tight">{name}</h2>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <p className="flex items-center text-3xl font-black">
                  <IndianRupee className="h-6 w-6" />
                  {currency.format(price).replace("₹", "")}
                </p>
                <p className="pb-1 text-sm font-semibold text-slate-400 line-through">
                  {currency.format(originalPrice)}
                </p>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">
                {cleanDescription}
              </p>
              <button
                type="button"
                onClick={(event) => onAddToCart?.(event.currentTarget)}
                className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#ff6700] px-4 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
            </div>
          </div>
          <style>{`
            @keyframes quickViewFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes quickViewZoom {
              from { opacity: 0; transform: scale(.94); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </div>

        <div
          className="fixed inset-0 z-[80] flex items-end bg-slate-950/55 animate-[quickViewFade_.18s_ease-out] md:hidden"
          onClick={closeQuickView}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${name} quick view`}
            data-product-scope
            className="w-full rounded-t-[1.75rem] bg-white shadow-2xl transition-transform duration-200 ease-out animate-[quickViewSheet_.24s_ease-out]"
            style={{ transform: `translateY(${touchOffset}px)` }}
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartY(event.touches[0]?.clientY ?? null)}
            onTouchMove={(event) => {
              if (touchStartY === null) return;
              const nextOffset = Math.max(0, (event.touches[0]?.clientY ?? touchStartY) - touchStartY);
              setTouchOffset(nextOffset);
            }}
            onTouchEnd={() => {
              if (touchOffset > 82) {
                closeQuickView();
                return;
              }

              setTouchStartY(null);
              setTouchOffset(0);
            }}
          >
            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-300" />
            <div className="max-h-[86vh] overflow-y-auto px-4 pb-6 pt-4">
              <div data-fly-image className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src={imageSrc}
                  alt={name}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <div className="pt-5">
                <span className="mb-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold capitalize text-[#ff6700]">
                  {category}
                </span>
                <h2 className="text-xl font-black leading-7 text-slate-950">
                  {name}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {cleanDescription}
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="flex items-center text-2xl font-black text-slate-950">
                    <IndianRupee className="h-5 w-5" />
                    {currency.format(price).replace("₹", "")}
                  </p>
                  <button
                    type="button"
                    aria-label="Close quick view"
                    onClick={closeQuickView}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition active:scale-95"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(event) => onAddToCart?.(event.currentTarget)}
                  className="mt-5 inline-flex h-[52px] min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#ff6700] px-4 text-base font-black text-white shadow-lg shadow-orange-500/20 transition active:scale-[0.98]"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </section>
          <style>{`
            @keyframes quickViewSheet {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      </>
    ) : null}
    </>
  );
}

export default memo(ProductCard);

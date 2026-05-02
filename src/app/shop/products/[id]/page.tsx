"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  Heart,
  IndianRupee,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import type { Product } from "@/types/product";
import { getProductById, getProducts } from "@/features/product/product.api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCart } from "@/features/cart/cartSlice";
import { flyProductImageToCart } from "@/utils/flyToCart";
import { openCartDrawer } from "@/utils/cartDrawerEvents";
import {
  fetchProductReviews,
  submitProductReview,
} from "@/features/reviews/review.api";
import ProductGrid from "@/components/product/ProductGrid";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import type { Review } from "@/types/review";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const toRupees = (price: number) => Math.max(1, Math.round(price));

function getPricing(product: Product) {
  const hash = Array.from(product.id).reduce(
    (total, char) => total + char.charCodeAt(0),
    0
  );
  const discount = 24 + ((hash * 9) % 46);
  const currentPrice = toRupees(product.price);
  const mrp = Math.round(currentPrice / (1 - discount / 100));
  return { discount, currentPrice, mrp };
}

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(String(id));
        const allProducts = await getProducts();
        const productReviews = await fetchProductReviews(String(id));
        setProduct(data);
        setReviews(productReviews);
        setRelated(
          allProducts
            .filter(
              (item) => item.category === data.category && item.id !== data.id
            )
            .slice(0, 5)
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const pricing = useMemo(
    () => (product ? getPricing(product) : null),
    [product]
  );

  const handleAddToCart = useCallback(async (trigger?: HTMLElement | null) => {
    if (!product) return;
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent("/cart")}`);
      return;
    }
    await flyProductImageToCart(trigger);
    dispatch(addToCart(product));
    openCartDrawer(product);
  }, [dispatch, isLoggedIn, product, router]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return product?.rating.rate ?? 0;
    return (
      reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length
    );
  }, [product?.rating.rate, reviews]);

  const reviewCount = reviews.length || product?.rating.count || 0;

  const handleReviewSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!product) return;

      if (!isLoggedIn || !user) {
        router.push(`/login?next=${encodeURIComponent(`/shop/products/${product.id}`)}`);
        return;
      }

      if (!reviewComment.trim()) {
        setReviewError("Write a review before submitting.");
        return;
      }

      try {
        setReviewLoading(true);
        setReviewError(null);
        const review = await submitProductReview({
          productId: product.id,
          userId: user.id,
          userName: user.name,
          rating: reviewRating,
          comment: reviewComment.trim(),
        });
        setReviews((current) => [review, ...current]);
        setReviewComment("");
        setReviewRating(5);
      } catch (err) {
        setReviewError(
          err instanceof Error ? err.message : "Failed to submit review"
        );
      } finally {
        setReviewLoading(false);
      }
    },
    [isLoggedIn, product, reviewComment, reviewRating, router, user]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="grid gap-8 md:grid-cols-[1fr_0.9fr]">
          <div className="h-[520px] animate-pulse rounded-[2rem] bg-slate-200" />
          <div className="space-y-4 rounded-[2rem] bg-white p-6 shadow-sm">
            <div className="h-8 w-3/4 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-1/2 animate-pulse rounded-full bg-slate-200" />
            <div className="h-12 w-1/3 animate-pulse rounded-full bg-slate-200" />
            <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 text-red-600 md:px-6">
        {error}
      </div>
    );
  }

  if (!product || !pricing) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        Product not found
      </div>
    );
  }

  const imageSrc =
    !imgError && product.image?.trim() ? product.image : "/placeholder.png";

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div data-product-scope className="grid gap-8 md:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div data-fly-image className="relative h-[420px] overflow-hidden rounded-[1.5rem] bg-white md:h-[560px]">
              <Image
                src={imageSrc}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain p-10 transition duration-500 hover:scale-105"
                onError={() => setImgError(true)}
              />
              <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-[#cc0c39] px-3 py-1.5 text-xs font-black text-white">
                <BadgePercent className="h-4 w-4" />
                {pricing.discount}% off
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-600">
                {product.category}
              </span>
              {pricing.discount > 30 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-[#cc0c39]">
                  <Zap className="h-3.5 w-3.5 fill-[#cc0c39]" />
                  Limited time deal
                </span>
              )}
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight text-slate-800 md:text-4xl">
              {product.title}
            </h1>

            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-sm font-black text-white">
                {averageRating.toFixed(1)}
                <Star className="h-3.5 w-3.5 fill-white stroke-white" />
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {reviewCount.toLocaleString("en-IN")} ratings
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <p className="flex items-center text-4xl font-black tracking-tight text-slate-800">
                <IndianRupee className="h-7 w-7" />
                {currency.format(pricing.currentPrice).replace("₹", "")}
              </p>
              <p className="pb-1 text-base font-semibold text-slate-400 line-through">
                {currency.format(pricing.mrp)}
              </p>
              <p className="pb-1 text-sm font-black text-emerald-600">
                Save {currency.format(pricing.mrp - pricing.currentPrice)}
              </p>
            </div>

            <p className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
              {product.description}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Truck, label: "Free delivery" },
                { icon: ShieldCheck, label: "GST invoice" },
                { icon: RotateCcw, label: "7-day returns" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700"
                >
                  <Icon className="mb-2 h-5 w-5 text-[#ff6700]" />
                  {label}
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                onClick={(event) => handleAddToCart(event.currentTarget)}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#ff6700] px-6 text-base font-black text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-[#f05f00] active:scale-95"
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </button>
              <button className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-[#cc0c39] hover:text-[#cc0c39] active:scale-95">
                <Heart className="h-5 w-5" />
                Wishlist
              </button>
            </div>
          </section>
        </div>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Reviews & Ratings
              </h2>
              <div className="mt-4 rounded-3xl border border-orange-100 bg-orange-50 p-5">
                <p className="text-4xl font-black text-slate-950">
                  {averageRating.toFixed(1)}
                </p>
                <div className="mt-2 flex text-[#ff9900]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${
                        index < Math.round(averageRating)
                          ? "fill-[#ff9900] stroke-[#ff9900]"
                          : "fill-white stroke-orange-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  Based on {reviewCount.toLocaleString("en-IN")} reviews
                </p>
              </div>

              <form className="mt-5 space-y-3" onSubmit={handleReviewSubmit}>
                <label className="block text-sm font-bold text-slate-800">
                  Your rating
                </label>
                <select
                  value={reviewRating}
                  onChange={(event) => setReviewRating(Number(event.target.value))}
                  className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:ring-2 focus:ring-orange-500"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} star{rating > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Share your experience"
                  className="min-h-28 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500"
                />
                {reviewError ? (
                  <p className="text-sm font-semibold text-red-600">
                    {reviewError}
                  </p>
                ) : null}
                <button
                  disabled={reviewLoading}
                  className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>

            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="font-bold text-slate-950">No reviews yet</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Be the first customer to review this product.
                  </p>
                </div>
              ) : (
                reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-slate-950">
                          {review.userName}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-sm font-black text-white">
                        {review.rating}
                        <Star className="h-3.5 w-3.5 fill-white stroke-white" />
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {review.comment}
                    </p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Related Products
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                More picks from the same category.
              </p>
            </div>
          </div>
          {related.length ? (
            <ProductGrid products={related} />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

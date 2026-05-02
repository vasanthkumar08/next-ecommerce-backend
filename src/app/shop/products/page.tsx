"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/features/product/productSlice";
import { useProductFilters } from "@/hooks/useProductFilters";
import ProductGrid from "@/components/product/ProductGrid";
import Sidebar from "@/components/layout/Sidebar";
import Filters from "@/components/product/ProductFilters";
import ActiveFilterBadges from "@/components/product/ActiveFilterBadges";

type SortKey = "default" | "price-asc" | "price-desc" | "rating";

function ProductsPageContent() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { items, status, error } = useAppSelector((state) => state.product);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>("default");

  const {
    filters,
    filtered,
    categories,
    priceFloor,
    priceCeiling,
    activeCount,
    setCategory,
    setPriceRange,
    setMinRating,
    setSearch,
    clearFilters,
    clearCategory,
    clearPrice,
    clearRating,
    clearSearch,
  } = useProductFilters(items);

  useEffect(() => {
    if (status === "idle") dispatch(fetchProducts());
  }, [dispatch, status]);

  useEffect(() => {
    const category = searchParams.get("cat")?.trim() || "all";
    const query = searchParams.get("q")?.trim() || "";
    const requestedSort = searchParams.get("sort") as SortKey | null;

    setCategory(category);
    setSearch(query);

    if (
      requestedSort === "price-asc" ||
      requestedSort === "price-desc" ||
      requestedSort === "rating"
    ) {
      setSort(requestedSort);
    } else {
      setSort("default");
    }
  }, [searchParams, setCategory, setSearch]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const displayed = [...filtered].sort((a, b) => {
    if (sort === "price-asc")  return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating")     return (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">All Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Discover our full collection
          </p>
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">

          {/* Mobile filter toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-[#e0e0e0] bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-[#ff6700] hover:text-[#ff6700] lg:hidden"
          >
            {/* ✅ FIX: explicit width/height on SVG — no Tailwind h-/w- needed */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M6 12h12M9 18h6" strokeLinecap="round" />
            </svg>
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ff6700] text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>

          <div className="flex-1" />

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-lg border border-[#e0e0e0] bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#ff6700]"
          >
            <option value="default">Sort: Featured</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Active filter badges */}
        <div className="mb-4">
          <ActiveFilterBadges
            filters={filters}
            priceFloor={priceFloor}
            priceCeiling={priceCeiling}
            onClearCategory={clearCategory}
            onClearPrice={clearPrice}
            onClearRating={clearRating}
            onClearSearch={clearSearch}
          />
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          <Sidebar open={sidebarOpen} onClose={closeSidebar}>
            <Filters
              filters={filters}
              categories={categories}
              priceFloor={priceFloor}
              priceCeiling={priceCeiling}
              onCategory={setCategory}
              onPriceRange={setPriceRange}
              onRating={setMinRating}
              onClear={clearFilters}
              activeCount={activeCount}
            />
          </Sidebar>

          <div className="min-w-0 flex-1">
            {status === "failed" && (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600">
                  {error ?? "Failed to load products"}
                </p>
                <button
                  onClick={() => dispatch(fetchProducts())}
                  className="rounded-lg bg-[#ff6700] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#f05f00]"
                >
                  Retry
                </button>
              </div>
            )}

            {status === "succeeded" && (
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {displayed.length}
                  </span>{" "}
                  of {items.length} products
                  {activeCount > 0 && (
                    <span className="ml-2 text-[#ff6700]">
                      ({activeCount} filter{activeCount > 1 ? "s" : ""} active)
                    </span>
                  )}
                </p>
                {activeCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-[#dc2626] transition hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {status === "succeeded" && displayed.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#e0e0e0] bg-white py-20 text-center shadow-sm">
                <p className="mb-1 text-4xl">🔍</p>
                <p className="mb-1 font-semibold text-slate-800">
                  No products match your filters
                </p>
                <p className="mb-5 text-sm text-slate-500">
                  Try adjusting category, price or rating.
                </p>
                <button
                  onClick={clearFilters}
                  className="rounded-lg bg-[#ff6700] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#f05f00]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            <ProductGrid
              products={displayed}
              loading={status === "loading"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ProductsPageContent />
    </Suspense>
  );
}

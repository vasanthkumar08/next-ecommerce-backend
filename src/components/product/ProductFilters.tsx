"use client";

import { memo } from "react";
import { ProductFilters, PriceRange } from "@/types/filter";

interface FiltersProps {
  filters: ProductFilters;
  categories: string[];
  priceFloor: number;
  priceCeiling: number;
  onCategory: (c: string) => void;
  onPriceRange: (r: PriceRange) => void;
  onRating: (r: number) => void;
  onClear: () => void;
  activeCount: number;
}

const RATINGS = [4, 3, 2, 1] as const;

function Filters({
  filters,
  categories,
  priceFloor,
  priceCeiling,
  onCategory,
  onPriceRange,
  onRating,
  onClear,
  activeCount,
}: FiltersProps) {
  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
          Filters
        </h2>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#ff6700] transition hover:bg-orange-100"
          >
            Clear all
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ff6700] text-[10px] text-white">
              {activeCount}
            </span>
          </button>
        )}
      </div>

      {/* ── Category ─────────────────────────────────── */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Category
        </p>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const active = filters.category === cat;
            return (
              <li key={cat}>
                <button
                  onClick={() => onCategory(cat)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[#ff6700] font-semibold text-white"
                      : "text-slate-700 hover:bg-[#f5f5f5]"
                  }`}
                >
                  <span className="capitalize">{cat}</span>
                  {active && (
                    <span className="ml-2 h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="border-t border-[#e0e0e0]" />

      {/* ── Price Range ──────────────────────────────── */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Price Range
        </p>

        <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-800">
          <span>${filters.priceRange.min.toFixed(0)}</span>
          <span>${filters.priceRange.max.toFixed(0)}</span>
        </div>

        {/* Min slider */}
        <div className="space-y-2">
          <label className="text-xs text-slate-500">Min price</label>
          <input
            type="range"
            min={priceFloor}
            max={priceCeiling}
            value={filters.priceRange.min}
            onChange={(e) =>
              onPriceRange({
                min: Math.min(Number(e.target.value), filters.priceRange.max - 1),
                max: filters.priceRange.max,
              })
            }
            className="h-1.5 w-full cursor-pointer accent-[#ff6700]"
          />

          {/* Max slider */}
          <label className="text-xs text-slate-500">Max price</label>
          <input
            type="range"
            min={priceFloor}
            max={priceCeiling}
            value={filters.priceRange.max}
            onChange={(e) =>
              onPriceRange({
                min: filters.priceRange.min,
                max: Math.max(Number(e.target.value), filters.priceRange.min + 1),
              })
            }
            className="h-1.5 w-full cursor-pointer accent-[#ff6700]"
          />
        </div>

        {/* Quick presets */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[
            { label: "Under $25", min: 0, max: 25 },
            { label: "$25–$100", min: 25, max: 100 },
            { label: "Over $100", min: 100, max: priceCeiling },
          ].map(({ label, min, max }) => {
            const active =
              filters.priceRange.min === min && filters.priceRange.max === max;
            return (
              <button
                key={label}
                onClick={() => onPriceRange({ min, max })}
                className={`rounded-full border px-2.5 py-1 text-xs transition ${
                  active
                    ? "border-[#ff6700] bg-[#ff6700] text-white"
                    : "border-[#e0e0e0] text-slate-600 hover:border-[#ff6700] hover:text-[#ff6700]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#e0e0e0]" />

      {/* ── Rating ────────────────────────────────────── */}
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Minimum Rating
        </p>
        <div className="space-y-1">
          <button
            onClick={() => onRating(0)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
              filters.minRating === 0
                ? "bg-[#ff6700] text-white"
                : "text-slate-700 hover:bg-[#f5f5f5]"
            }`}
          >
            All ratings
          </button>
          {RATINGS.map((r) => (
            <button
              key={r}
              onClick={() => onRating(r)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                filters.minRating === r
                  ? "bg-[#ff6700] text-white"
                  : "text-slate-700 hover:bg-[#f5f5f5]"
              }`}
            >
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 20 20"
                    className={`h-3.5 w-3.5 ${
                      i < r
                        ? filters.minRating === r
                          ? "fill-amber-300"
                          : "fill-[#ff9900]"
                        : filters.minRating === r
                        ? "fill-white/30"
                        : "fill-[#e0e0e0]"
                    }`}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </span>
              <span className="text-xs">& up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(Filters);

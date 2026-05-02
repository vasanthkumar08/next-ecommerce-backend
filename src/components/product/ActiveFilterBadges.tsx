"use client";

import { memo } from "react";
import { ProductFilters } from "@/types/filter";

interface Props {
  filters: ProductFilters;
  priceFloor: number;
  priceCeiling: number;
  onClearCategory: () => void;
  onClearPrice: () => void;
  onClearRating: () => void;
  onClearSearch: () => void;
}

function XIcon() {
  return (
    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current">
      <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

function Badge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1a73e8]/30 bg-[#1a73e8]/8 px-3 py-1 text-xs font-medium text-[#1a73e8]">
      {label}
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 transition hover:bg-[#1a73e8] hover:text-white"
        aria-label={`Remove ${label} filter`}
      >
        <XIcon />
      </button>
    </span>
  );
}

function ActiveFilterBadges({
  filters,
  priceFloor,
  priceCeiling,
  onClearCategory,
  onClearPrice,
  onClearRating,
  onClearSearch,
}: Props) {
  const hasCat = filters.category !== "all";
  const hasPrice =
    filters.priceRange.min !== priceFloor ||
    filters.priceRange.max !== priceCeiling;
  const hasRating = filters.minRating > 0;
  const hasSearch = filters.search.trim().length > 0;

  if (!hasCat && !hasPrice && !hasRating && !hasSearch) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-[#666666]">Active:</span>

      {hasCat && (
        <Badge
          label={`Category: ${filters.category}`}
          onRemove={onClearCategory}
        />
      )}

      {hasPrice && (
        <Badge
          label={`$${filters.priceRange.min}–$${filters.priceRange.max}`}
          onRemove={onClearPrice}
        />
      )}

      {hasRating && (
        <Badge
          label={`${filters.minRating}★ & up`}
          onRemove={onClearRating}
        />
      )}

      {hasSearch && (
        <Badge
          label={`"${filters.search}"`}
          onRemove={onClearSearch}
        />
      )}
    </div>
  );
}

export default memo(ActiveFilterBadges);

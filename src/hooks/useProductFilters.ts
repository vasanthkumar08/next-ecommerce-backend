import { useMemo, useState, useCallback } from "react";
import { Product } from "@/types/product";
import { ProductFilters, DEFAULT_FILTERS, PriceRange } from "@/types/filter";

export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);

  /* ── derived values ─────────────────────────────────── */

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const priceFloor = useMemo(
    () => Math.floor(Math.min(...products.map((p) => p.price), 0)),
    [products]
  );

  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(...products.map((p) => p.price), 1000)),
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        filters.category === "all" || p.category === filters.category;

      const matchPrice =
        p.price >= filters.priceRange.min &&
        p.price <= filters.priceRange.max;

      const matchRating =
        filters.minRating === 0 ||
        (p.rating?.rate ?? 0) >= filters.minRating;

      const matchSearch =
        filters.search.trim() === "" ||
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase());

      return matchCategory && matchPrice && matchRating && matchSearch;
    });
  }, [products, filters]);

  /* ── active filter count for badge ─────────────────── */
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (
      filters.priceRange.min !== priceFloor ||
      filters.priceRange.max !== priceCeiling
    )
      count++;
    if (filters.minRating > 0) count++;
    if (filters.search.trim()) count++;
    return count;
  }, [filters, priceFloor, priceCeiling]);

  /* ── setters ─────────────────────────────────────────── */

  const setCategory = useCallback((category: string) => {
    setFilters((prev) => ({ ...prev, category }));
  }, []);

  const setPriceRange = useCallback((priceRange: PriceRange) => {
    setFilters((prev) => ({ ...prev, priceRange }));
  }, []);

  const setMinRating = useCallback((minRating: number) => {
    setFilters((prev) => ({ ...prev, minRating }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      priceRange: { min: priceFloor, max: priceCeiling },
    });
  }, [priceFloor, priceCeiling]);

  const clearCategory = useCallback(
    () => setFilters((prev) => ({ ...prev, category: "all" })),
    []
  );
  const clearPrice = useCallback(
    () =>
      setFilters((prev) => ({
        ...prev,
        priceRange: { min: priceFloor, max: priceCeiling },
      })),
    [priceFloor, priceCeiling]
  );
  const clearRating = useCallback(
    () => setFilters((prev) => ({ ...prev, minRating: 0 })),
    []
  );
  const clearSearch = useCallback(
    () => setFilters((prev) => ({ ...prev, search: "" })),
    []
  );

  return {
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
  };
}

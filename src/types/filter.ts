export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  category: string;
  priceRange: PriceRange;
  minRating: number;
  search: string;
}

export const DEFAULT_FILTERS: ProductFilters = {
  category: "all",
  priceRange: { min: 0, max: 10000 },
  minRating: 0,
  search: "",
};
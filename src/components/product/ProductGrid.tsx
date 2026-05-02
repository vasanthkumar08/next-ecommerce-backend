import { memo } from "react";
import { Product } from "@/types/product";
import ProductCard from "./ProductCard";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

interface Props {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
}

function ProductGrid({ products, loading = false, skeletonCount = 10 }: Props) {
  if (loading) {
    return (
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e0e0e0] bg-white py-20 text-center shadow-sm">
        <p className="mb-2 text-5xl">🛒</p>
        <p className="font-semibold text-slate-800">No products found</p>
        <p className="mt-1 text-sm text-slate-500">
          Try adjusting your filters
        </p>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default memo(ProductGrid);

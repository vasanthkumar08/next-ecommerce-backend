interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export default function Skeleton({
  className = "",
  width,
  height,
  rounded = false,
}: SkeletonProps) {
  return (
    <div
      className={[
        "skeleton",
        rounded ? "rounded-full" : "rounded-lg",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e0e0e0] bg-white p-4 shadow-sm">
      <Skeleton className="mb-3 h-44 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-3 h-3 w-1/2" />
      <Skeleton className="mb-3 h-5 w-1/3" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
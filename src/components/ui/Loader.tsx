type LoaderSize = "sm" | "md" | "lg";

interface LoaderProps {
  size?: LoaderSize;
  color?: string;
  label?: string;
}

const PX: Record<LoaderSize, number> = { sm: 18, md: 34, lg: 50 };

export default function Loader({
  size = "md",
  color = "#ff6700",
  label = "Loading…",
}: LoaderProps) {
  const px = PX[size];

  return (
    <div
      role="status"
      aria-label={label}
      className="flex flex-col items-center justify-center gap-3"
    >
      {/* ✅ width/height as SVG attributes — never affected by Tailwind purge */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke={`${color}25`} strokeWidth="3" />
        <path
          d="M12 2a10 10 0 0110 10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {label && (
        <span className="text-xs text-[#666666]">{label}</span>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader size="lg" />
    </div>
  );
}

import Image from "next/image";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { px: number; cls: string }> = {
  xs: { px: 24, cls: "h-6 w-6 text-[10px]" },
  sm: { px: 32, cls: "h-8 w-8 text-xs" },
  md: { px: 40, cls: "h-10 w-10 text-sm" },
  lg: { px: 48, cls: "h-12 w-12 text-base" },
  xl: { px: 64, cls: "h-16 w-16 text-lg" },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Deterministic colour from name
const PALETTE = [
  "#1a73e8", "#0d47a1", "#ff9900", "#16a34a",
  "#7c3aed", "#db2777", "#0891b2", "#d97706",
];
function avatarColor(name = "") {
  let hash = 0;
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({
  src,
  name = "",
  size = "md",
  className = "",
}: AvatarProps) {
  const { px, cls } = sizeMap[size];
  const bg = avatarColor(name);

  return (
    <div
      className={[
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ring-2 ring-white",
        cls,
        className,
      ].join(" ")}
      style={!src ? { backgroundColor: bg } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "avatar"}
          fill
          className="object-cover"
          sizes={`${px}px`}
        />
      ) : (
        <span>{getInitials(name) || "?"}</span>
      )}
    </div>
  );
}
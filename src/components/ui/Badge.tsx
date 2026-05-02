import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "gray"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "success"
  | "warning"
  | "danger";

const variants: Record<BadgeVariant, string> = {
  default: "border-transparent bg-[#2563EB] text-white",
  secondary: "border-transparent bg-[#38BDF8]/20 text-slate-700",
  destructive: "border-transparent bg-red-500 text-white",
  outline: "border-slate-200 bg-white text-slate-700",
  gray: "border-transparent bg-slate-100 text-slate-700",
  blue: "border-transparent bg-[#2563EB]/10 text-[#2563EB]",
  green: "border-transparent bg-green-100 text-green-700",
  orange: "border-transparent bg-yellow-100 text-yellow-700",
  red: "border-transparent bg-red-100 text-red-700",
  success: "border-transparent bg-green-100 text-green-700",
  warning: "border-transparent bg-yellow-100 text-yellow-700",
  danger: "border-transparent bg-red-100 text-red-700",
};

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: BadgeVariant;
  dot?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
      {children}
    </div>
  );
}

export default Badge;

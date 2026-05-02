import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "danger"
  | "outline"
  | "orange";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  default: "bg-[#2563EB] text-white hover:bg-blue-700",
  primary: "bg-[#2563EB] text-white hover:bg-blue-700",
  secondary: "bg-[#38BDF8] text-white hover:bg-sky-500",
  ghost: "text-slate-700 hover:bg-[#F8FAFC]",
  destructive: "bg-red-500 text-white hover:bg-red-600",
  danger: "bg-red-500 text-white hover:bg-red-600",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-[#F8FAFC]",
  orange: "bg-[#38BDF8] text-white hover:bg-sky-500",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";
export default Button;

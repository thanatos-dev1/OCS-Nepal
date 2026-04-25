import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "cta" | "outline" | "ghost" | "muted" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-active",
  cta:     "bg-accent text-white hover:bg-accent-hover active:bg-accent-active",
  outline: "border border-primary/30 text-primary hover:bg-primary-light active:bg-primary-light",
  ghost:   "text-gray-600 hover:bg-surface hover:text-gray-900",
  muted:   "bg-bg-subtle text-text-disabled border border-border cursor-not-allowed",
  danger:  "bg-red-600 text-white hover:bg-red-500 active:bg-red-700",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-6 py-3 text-base rounded-lg",
};

const spinnerSizes: Record<Size, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

export default function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className={cn("animate-spin shrink-0", spinnerSizes[size])}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

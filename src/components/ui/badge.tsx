import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "premium";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-brand text-white",
    secondary: "bg-raised text-accent-strong font-semibold",
    success: "bg-success-surface text-success border border-success-line",
    warning: "bg-warning-surface text-warning border border-warning-line",
    destructive: "bg-danger-surface text-danger border border-danger-line",
    outline: "border border-outline text-ink",
    premium: "bg-warning-surface text-warning border border-warning-line shadow-sm font-semibold tracking-wide uppercase",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

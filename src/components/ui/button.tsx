import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "rose";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none";

    const variantStyles = {
      default: "bg-[#b65b69] text-white hover:bg-[#8f3e4d] shadow-sm active:translate-y-px",
      rose: "bg-[#b65b69] text-white hover:bg-[#8f3e4d] shadow-sm active:translate-y-px",
      outline: "border border-[#ded3cf] bg-white text-[#292526] hover:bg-[#fbf7f3] hover:text-[#8f3e4d]",
      secondary: "bg-[#fbf7f3] text-[#292526] hover:bg-[#f4ebe6]",
      ghost: "hover:bg-[#fbf7f3] text-[#292526] hover:text-[#8f3e4d]",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-12 rounded-md px-6 text-base",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyle, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

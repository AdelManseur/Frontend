import React, { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1DBF73] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[#1DBF73] text-white hover:bg-[#19a463] border border-transparent",
    secondary: "bg-[#171717] text-white hover:bg-[#222222] border border-transparent",
    outline: "bg-transparent text-[#171717] border border-[#171717] hover:bg-[#fafafa]",
    ghost: "bg-transparent text-[#737373] hover:bg-[#fafafa] hover:text-[#171717] border border-transparent"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2 text-[15px]",
    lg: "px-8 py-3 text-lg"
  };

  const classes = [
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    disabled || isLoading ? "opacity-60 cursor-not-allowed active:scale-100" : "",
    className
  ].join(" ");

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
}

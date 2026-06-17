import React from "react";
import Spinner from "./Spinner.jsx";

export function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  const baseStyle = "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent/80";
  
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    ghost: "btn-ghost",
    outline: "border border-ink/10 text-ink/70 hover:bg-ink/5 hover:text-ink focus:ring-4 focus:ring-ink/5",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3 text-base rounded-xl",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="xs" className="border-current" />}
      {children}
    </button>
  );
}
export default Button;

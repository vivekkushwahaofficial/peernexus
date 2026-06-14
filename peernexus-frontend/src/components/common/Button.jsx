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
  const baseStyle = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-accent/90 focus:ring-2 focus:ring-accent/20",
    secondary: "bg-ink text-pearl hover:bg-ink/80 focus:ring-2 focus:ring-ink/20",
    danger: "bg-ember text-white hover:bg-ember/90 focus:ring-2 focus:ring-ember/20",
    ghost: "text-ink/70 hover:bg-ink/5",
    outline: "border border-ink/15 text-ink hover:bg-ink/5",
  };

  const sizes = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="xs" className="border-white" />}
      {children}
    </button>
  );
}
export default Button;

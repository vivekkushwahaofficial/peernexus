import React from "react";

export function Avatar({
  src,
  name = "",
  size = "md",
  status = null, // "online" | "offline"
  className = "",
}) {
  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
  };

  const statusIndicatorSizes = {
    xs: "h-1.5 w-1.5 bottom-0 right-0",
    sm: "h-2 w-2 bottom-0 right-0",
    md: "h-2.5 w-2.5 bottom-0 right-0 border-2",
    lg: "h-3.5 w-3.5 bottom-0.5 right-0.5 border-2",
    xl: "h-4 w-4 bottom-1 right-1 border-2",
  };

  const getInitials = (fullName) => {
    if (!fullName) return "?";
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`rounded-full object-cover border border-ink/10 ${sizes[size]}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = ""; // Force fallback to initials
          }}
        />
      ) : (
        <div
          className={`rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold flex items-center justify-center select-none uppercase ${sizes[size]}`}
        >
          {getInitials(name)}
        </div>
      )}

      {status && (
        <span
          className={`absolute rounded-full border-white ${
            status === "online" ? "bg-emerald-500" : "bg-slate-400"
          } ${statusIndicatorSizes[size]}`}
        />
      )}
    </div>
  );
}
export default Avatar;

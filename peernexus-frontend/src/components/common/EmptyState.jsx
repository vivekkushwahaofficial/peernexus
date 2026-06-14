import React from "react";
import Button from "./Button.jsx";

export function EmptyState({
  title = "No data found",
  description = "There's nothing here yet. Try adjusting your filters or checking back later.",
  icon,
  actionText,
  onAction,
  className = "",
}) {
  return (
    <div className={`card p-8 text-center flex flex-col items-center justify-center gap-4 max-w-md mx-auto ${className}`}>
      {icon ? (
        <div className="text-ink/30">{icon}</div>
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-ink/30">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h4 className="text-base font-bold text-ink">{title}</h4>
        <p className="text-sm text-ink/60 leading-relaxed">{description}</p>
      </div>

      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

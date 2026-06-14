import React from "react";

export function StatCard({ title, value, icon, description }) {
  return (
    <div className="card p-5 bg-white flex items-center justify-between shadow-sm">
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-[10px] font-semibold text-ink/40 uppercase tracking-widest">
          {title}
        </span>
        <span className="text-2xl font-bold text-ink font-display">{value}</span>
        {description && <p className="text-[10px] text-ink/40">{description}</p>}
      </div>

      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/15 flex items-center justify-center text-accent shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
}

export default StatCard;

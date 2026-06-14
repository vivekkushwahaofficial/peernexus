import React from "react";

export function Badge({ children, variant = "neutral", className = "" }) {
  const variants = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    primary: "bg-accent/10 text-accent border-accent/20",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-ember/10 text-ember border-ember/20",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    // Roles
    admin: "bg-rose-50 text-rose-700 border-rose-200",
    moderator: "bg-purple-50 text-purple-700 border-purple-200",
    verified: "bg-teal-50 text-teal-700 border-teal-200",
    student: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function RoleBadge({ role, className = "" }) {
  if (!role) return null;
  const cleanRole = role.replace("ROLE_", "").toLowerCase();

  const maps = {
    admin: { label: "Admin", variant: "admin" },
    moderator: { label: "Mod", variant: "moderator" },
    verified_student: { label: "Verified Student", variant: "verified" },
    student: { label: "Student", variant: "student" },
  };

  const config = maps[cleanRole] || { label: role, variant: "neutral" };

  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}

export default Badge;

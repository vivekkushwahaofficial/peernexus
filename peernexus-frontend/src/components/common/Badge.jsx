import React from "react";

export function Badge({ children, variant = "neutral", className = "" }) {
  const variants = {
    neutral: "bg-ink/5 text-ink/70 border-ink/5",
    primary: "bg-accent/8 text-accent border-accent/10",
    success: "bg-success/8 text-success border-success/10",
    warning: "bg-warning/8 text-warning border-warning/10",
    danger: "bg-error/8 text-error border-error/10",
    info: "bg-info/8 text-info border-info/10",
    // Roles
    admin: "bg-red-500/8 text-red-600 border-red-500/10",
    moderator: "bg-indigo-500/8 text-indigo-600 border-indigo-500/10",
    verified: "bg-accent/8 text-accent border-accent/10",
    student: "bg-ink/5 text-ink/60 border-ink/5",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${variants[variant]} ${className}`}
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

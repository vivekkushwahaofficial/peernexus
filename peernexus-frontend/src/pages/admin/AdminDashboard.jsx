import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAdminDashboardStats } from "../../hooks/useAdmin.js";
import StatCard from "../../components/admin/StatCard.jsx";
import Spinner from "../../components/common/Spinner.jsx";

// Reusable Admin Navigation header
export function AdminNavbar() {
  const links = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/reports", label: "Abuse Reports" },
    { to: "/admin/moderation", label: "Moderation Actions" },
    { to: "/admin/audit-log", label: "Security Audit Log" },
  ];

  return (
    <div className="flex flex-wrap gap-2 border-b border-ink/8 pb-4 mb-6">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
              isActive
                ? "bg-rose-50 text-rose-700 border-rose-200 shadow-sm"
                : "bg-white text-ink/60 border-ink/8 hover:bg-slate-50 hover:text-ink"
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminDashboardStats();

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-rose-700 font-display">Moderation Center</h1>
        <p className="text-xs text-ink/50 mt-1">Monitor community integrity and resolve reported violations.</p>
      </div>

      <AdminNavbar />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            description="Registered accounts"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            }
          />
          <StatCard
            title="Open Reports"
            value={stats?.openReports || 0}
            description="Pending admin review"
            icon={
              <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <StatCard
            title="Total Doubts"
            value={stats?.totalDoubts || 0}
            description="Academic questions asked"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Total Solutions"
            value={stats?.totalAnswers || 0}
            description="Explanations posted"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Study Groups"
            value={stats?.totalGroups || 0}
            description="Sub-communities created"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatCard
            title="Chat Messages"
            value={stats?.totalMessages || 0}
            description="Private chat communications"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
          />
          <StatCard
            title="Student Connections"
            value={stats?.totalConnections || 0}
            description="Accepted friend links"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            }
          />
          <StatCard
            title="Resolved Reports"
            value={stats?.resolvedReports || 0}
            description="Total violations closed"
            icon={
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

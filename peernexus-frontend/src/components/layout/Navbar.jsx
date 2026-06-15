import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import Avatar from "../common/Avatar.jsx";

export function Navbar({ onToggleMenu, isMenuOpen }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notificationPage } = useNotifications({ size: 100 }, { enabled: isAuthenticated });
  const unreadCount = notificationPage?.content?.filter((n) => !n.read).length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doubts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand Container with mobile menu trigger */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={onToggleMenu}
              className="md:hidden p-1.5 rounded-xl text-ink/75 hover:bg-slate-100 hover:text-ink transition focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-lg shadow-md shadow-accent/20">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-ink font-display">
              Peer<span className="text-accent">Nexus</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="hidden sm:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-ink/10 bg-slate-50 px-4 py-1.5 pl-10 text-xs text-ink placeholder:text-ink/40 outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/15"
            />
            <svg className="w-4 h-4 text-ink/40 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        )}

        {/* Navigation Items */}
        <div className="flex items-center gap-5">
          {isAuthenticated ? (
            <>
              {/* Notifications Link */}
              <Link to="/notifications" className="relative p-2 rounded-full hover:bg-slate-100 transition text-ink/75 hover:text-ink">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ember text-[9px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full p-1 hover:bg-slate-100 transition outline-none"
                >
                  <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
                  <span className="hidden md:inline text-xs font-semibold text-ink/80">{user?.name}</span>
                  <svg className={`w-4 h-4 text-ink/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-ink/8 bg-white p-2 shadow-xl z-20 animate-slide-up">
                      <div className="px-3 py-2 border-b border-ink/8 mb-1">
                        <p className="text-xs font-bold text-ink truncate">{user?.name}</p>
                        <p className="text-[10px] text-ink/40 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center px-3 py-2 text-xs font-medium text-ink/75 hover:bg-slate-50 hover:text-ink rounded-lg transition"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/profile/edit"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center px-3 py-2 text-xs font-medium text-ink/75 hover:bg-slate-50 hover:text-ink rounded-lg transition"
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition text-left"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs font-bold text-ink/70 hover:text-ink transition">
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-xs font-bold text-white transition hover:bg-accent/90 active:scale-95"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;

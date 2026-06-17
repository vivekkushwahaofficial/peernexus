import React, { useState, useEffect } from "react";
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

  // Listen to Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("navbar-search-input");
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-white/70 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Brand Container with mobile menu trigger */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onToggleMenu}
              className="md:hidden p-2 rounded-xl text-ink/60 hover:bg-ink/5 hover:text-ink transition-all focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isMenuOpen ? (
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-lg shadow-md shadow-accent/15 select-none">
              P
            </div>
            <span className="text-lg font-bold tracking-tight text-ink font-display">
              Peer<span className="text-accent">Nexus</span>
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        {isAuthenticated && (
          <form onSubmit={handleSearch} className="hidden sm:flex items-center relative max-w-xs w-full">
            <input
              id="navbar-search-input"
              type="text"
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-ink/10 bg-ink/[0.02] px-4 py-1.5 pl-9 pr-12 text-xs text-ink placeholder:text-ink/30 outline-none transition-all focus:border-accent/80 focus:bg-white focus:ring-4 focus:ring-accent/10"
            />
            <svg className="w-4 h-4 text-ink/30 absolute left-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <div className="absolute right-2 px-1.5 py-0.5 rounded border border-ink/10 bg-white text-[9px] font-semibold text-ink/30 shadow-sm pointer-events-none select-none">
              ⌘K
            </div>
          </form>
        )}

        {/* Navigation Items */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Notifications Link */}
              <Link to="/notifications" className="relative p-2 rounded-xl hover:bg-ink/5 transition-all text-ink/60 hover:text-ink">
                <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ember text-[8px] font-bold text-white ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-ink/5 transition-all outline-none cursor-pointer"
                >
                  <Avatar src={user?.avatarUrl} name={user?.name} size="sm" />
                  <span className="hidden md:inline text-xs font-bold text-ink/80">{user?.name}</span>
                  <svg className={`w-4 h-4 text-ink/30 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-2xl border border-ink/5 bg-white p-2 shadow-xl z-20 animate-slide-up">
                      <div className="px-3 py-2 border-b border-ink/5 mb-1.5">
                        <p className="text-xs font-bold text-ink truncate">{user?.name}</p>
                        <p className="text-[10px] font-medium text-ink/40 truncate">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center px-3 py-2 text-xs font-bold text-ink/70 hover:bg-ink/[0.03] hover:text-ink rounded-lg transition"
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/profile/edit"
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center px-3 py-2 text-xs font-bold text-ink/70 hover:bg-ink/[0.03] hover:text-ink rounded-lg transition"
                      >
                        Edit Profile
                      </Link>
                      <div className="border-t border-ink/5 my-1.5" />
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center px-3 py-2 text-xs font-bold text-error hover:bg-error/5 rounded-lg transition text-left cursor-pointer"
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
              <Link to="/login" className="text-xs font-bold text-ink/65 hover:text-ink transition">
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2 text-xs font-bold text-white transition hover:bg-accent/90 shadow-sm shadow-accent/10 active:scale-95"
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

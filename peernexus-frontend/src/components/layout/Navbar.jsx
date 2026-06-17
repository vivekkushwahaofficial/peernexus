import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import Avatar from "../common/Avatar.jsx";

export function Navbar({ onToggleMenu, isMenuOpen }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notificationPage } = useNotifications({ size: 100 }, { enabled: isAuthenticated });
  const unreadCount = notificationPage?.content?.filter((n) => !n.read).length || 0;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doubts?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Scroll detection to morph backgrounds
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Ctrl+K to focus search input
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

  const handleNavClick = (e, targetId) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        window.history.pushState(null, null, `#${targetId}`);
      }
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  const isLandingPage = location.pathname === "/" && !isAuthenticated;
  const headerBgClass = isScrolled || !isLandingPage
    ? "bg-white/85 backdrop-blur-xl border-b border-ink/5 shadow-sm"
    : "bg-transparent border-b border-transparent";

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Showcase", id: "showcase" },
    { label: "Architecture", id: "architecture" },
    { label: "FAQ", id: "faq" }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBgClass}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* BRAND LOGO SECTION */}
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

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-lg shadow-md shadow-accent/15 group-hover:scale-105 transition-all select-none">
              P
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-ink leading-tight font-display">
                Peer<span className="text-accent">Nexus</span>
              </span>
              {!isAuthenticated && (
                <span className="hidden sm:inline text-[8px] font-bold text-ink/40 tracking-wider uppercase -mt-0.5">
                  Peer Learning Platform
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* CENTER NAVIGATION (UNAUTHENTICATED) */}
        {!isAuthenticated && (
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={`/#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className="text-xs font-bold text-ink/60 hover:text-accent transition duration-150 relative py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* SEARCH BAR (AUTHENTICATED) */}
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

        {/* RIGHT ACTIONS SECTION */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
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
              {/* GitHub Link */}
              <a
                href="https://github.com/vivekkushwahaofficial/peernexus"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center justify-center p-2 rounded-xl text-ink/60 hover:bg-ink/5 hover:text-ink transition-all"
                aria-label="GitHub Repository"
              >
                <svg className="w-5.5 h-5.5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              <Link to="/login" className="text-xs font-bold text-ink/65 hover:text-accent transition px-2">
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2 text-xs font-bold text-white transition hover:bg-accent/90 shadow-sm shadow-accent/10 active:scale-95"
              >
                Get Started
              </Link>

              {/* Hamburger Menu (Unauthenticated Mobile Toggle) */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-ink/60 hover:bg-ink/5 hover:text-ink transition-all focus:outline-none cursor-pointer"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5.5 h-5.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE DRAWER (UNAUTHENTICATED VISITORS) */}
      {!isAuthenticated && mobileMenuOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-ink/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-ink/5 p-6 z-50 md:hidden flex flex-col gap-5 shadow-xl animate-slide-up">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  to={`/#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                  className="text-sm font-bold text-ink/70 hover:text-accent transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-ink/5 pt-4 flex flex-col gap-3">
              <a
                href="https://github.com/vivekkushwahaofficial/peernexus"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-ink/65 hover:text-ink"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>Explore GitHub Repository</span>
              </a>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accent/90 transition shadow-sm shadow-accent/10"
              >
                Get Started
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;

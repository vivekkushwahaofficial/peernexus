import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import { useAuth } from "../../hooks/useAuth.js";

export default function AppLayout() {
  const { isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-pearl text-ink flex flex-col">
      <Navbar onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isMenuOpen={isMobileMenuOpen} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {isAuthenticated && (
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        )}
        <main className="flex-1 min-w-0 px-4 py-6 sm:px-6 md:px-8 md:py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

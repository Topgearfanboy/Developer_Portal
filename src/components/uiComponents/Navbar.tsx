"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-xl font-bold text-text">
            Real Estate Analyzer
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-text-muted hover:text-text transition-colors"
          >
            Dashboard
          </Link>
          <div className="w-px h-5 bg-border"></div>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen((open) => !open)}
                    className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-gray-100 transition-colors"
                    aria-label="User menu"
                    aria-expanded={menuOpen}
                    data-testid="user-menu-button"
                  >
                    {menuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>
                  {menuOpen && (
                    <div
                      data-testid="user-menu"
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-border py-1 z-50"
                    >
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-text truncate">
                          {user?.name || user?.email}
                        </p>
                      </div>
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:bg-gray-50 hover:text-text transition-colors"
                        data-testid="settings-link"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        data-testid="logout-button"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Login
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// components/Navigation.tsx
'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || "";

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      setHasToken(!!token);
    }
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
    setHasToken(false);
    router.push("/register?mode=signin");
  };

  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center">
            <span className="text-2xl font-bold">FinTrack</span>
          </div>
        </div>
      </nav>
    );
  }

  const isAuthPage =
    pathname === "/login" ||
    pathname.startsWith("/register");

  if (isAuthPage) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link
            href={hasToken ? "/dashboard" : "/"}
            className="text-2xl font-bold text-indigo-600"
          >
            FinTrack
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {hasToken ? (
              <>
                <Link
                  href="/dashboard"
                  className={`${isActive("/dashboard") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}
                >
                  Dashboard
                </Link>

                <Link
                  href="/transactions"
                  className={`${isActive("/transactions") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}
                >
                  Transactions
                </Link>

                <Link
                  href="/goals-budgets"
                  className={`${isActive("/goals-budgets") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}
                >
                  Goals & Budgets
                </Link>

                <Link
                  href="/reports"
                  className={`${isActive("/reports") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}
                >
                  Reports
                </Link>

                {/* Notifications + Logout */}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                  <button
                    onClick={() => router.push("/notifications")}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Bell className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/register?mode=signin" className="text-gray-700 hover:text-indigo-600">Log In</Link>
                <Link href="/register?mode=signup" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
          <div className="px-4 py-4 space-y-2">

            {hasToken ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/dashboard") ? "bg-indigo-100" : ""}`}>
                  Dashboard
                </Link>

                <Link href="/transactions" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/transactions") ? "bg-indigo-100" : ""}`}>
                  Transactions
                </Link>

                <Link href="/goals-budgets" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/goals-budgets") ? "bg-indigo-100" : ""}`}>
                  Goals & Budgets
                </Link>

                <Link href="/reports" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/reports") ? "bg-indigo-100" : ""}`}>
                  Reports
                </Link>

                <div className="pt-2 border-t border-gray-300">
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/register?mode=signin" className="block px-4 py-3">Log In</Link>
                <Link href="/register?mode=signup" className="block px-4 py-3 bg-indigo-600 text-white text-center rounded-lg">Sign Up</Link>
              </>
            )}

          </div>
        </div>
      )}
    </nav>
  );
}

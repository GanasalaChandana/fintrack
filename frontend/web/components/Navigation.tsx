// components/Navigation.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, LogOut, Menu } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname() || '';

  // Client-only token check (supports both keys)
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const t =
        localStorage.getItem('authToken') ||
        localStorage.getItem('ft_token');
      setHasToken(!!t);
    }
  }, [pathname]); // Re-check when pathname changes

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('ft_token');
      localStorage.removeItem('user');
    }
    setHasToken(false);
    router.push('/register?mode=signin');
  };

  // Skeleton during first paint to avoid hydration mismatches
  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              FinTrack
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Don't render on auth pages
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/register?');
  if (isAuthPage) return null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition">
            FinTrack
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            {hasToken ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">Dashboard</Link>
                <Link href="/transactions" className="text-gray-700 hover:text-indigo-600 font-medium">Transactions</Link>
                <Link href="/budget" className="text-gray-700 hover:text-indigo-600 font-medium">Budget</Link>
                <Link href="/reports" className="text-gray-700 hover:text-indigo-600 font-medium">Reports</Link>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/notifications')}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    aria-label="Open notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/register?mode=signin" className="text-gray-700 hover:text-indigo-600 font-medium">
                  Log In
                </Link>
                <Link
                  href="/register?mode=signup"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm hover:shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            {hasToken ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-indigo-50 rounded-lg">Dashboard</Link>
                <Link href="/transactions" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-indigo-50 rounded-lg">Transactions</Link>
                <Link href="/budget" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-indigo-50 rounded-lg">Budget</Link>
                <Link href="/reports" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-indigo-50 rounded-lg">Reports</Link>
                <Link href="/notifications" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-indigo-50 rounded-lg">Notifications</Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/register?mode=signin" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-indigo-50 rounded-lg">Log In</Link>
                <Link href="/register?mode=signup" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 bg-indigo-600 text-white rounded-lg text-center">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
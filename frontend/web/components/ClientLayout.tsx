'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getToken } from '@/lib/api';
import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { DarkModeToggle } from "@/components/providers/DarkModeProvider";
import { BudgetAlerts } from '@/components/BudgetAlerts';

// ✅ Helper to check if route is public/auth
function isPublicRoute(path: string | null): boolean {
  if (!path) return true;
  
  const publicPaths = ['/', '/login', '/register', '/signin', '/signup', '/auth'];
  
  // Check exact match
  if (publicPaths.includes(path)) return true;
  
  // Check if starts with public path
  return publicPaths.some(p => path.startsWith(`${p}/`) || path.startsWith(`${p}?`));
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // ✅ IMPROVED: Check if we're on an auth/public page
  const isAuthPage = isPublicRoute(pathname);

  // ✅ CRITICAL: Redirect to login if trying to access protected pages without token
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthPage) {
      const token = getToken();
      
      if (!token) {
        console.log('🚫 ClientLayout: No token on protected page, redirecting to login');
        router.replace('/login?mode=signin&reason=auth_required');
      }
    }
  }, [pathname, isAuthPage, router]);

  return (
    <>
      {/* Dark Mode Toggle Button */}
      <div className="fixed right-4 top-4 z-50">
        <DarkModeToggle />
      </div>

      {/* Top Navigation - hide on auth pages */}
      {!isAuthPage && <Navigation />}
      
      {/* Budget Alerts - only on authenticated pages */}
      {!isAuthPage && <BudgetAlerts />}

      {/* Page Content */}
      {children}

      {/* Bottom Mobile Navigation - hide on auth pages */}
      {!isAuthPage && <MobileBottomNav />}
    </>
  );
}
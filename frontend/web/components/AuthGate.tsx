'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { GoogleCredentialResponse } from '@/types/google';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/register', '/'];
    
    if (pathname && publicRoutes.includes(pathname)) {
      setIsAuthenticated(true); // Allow access to public routes
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken') || localStorage.getItem('ft_token');
    
    if (!token) {
      console.log('🔒 No auth token found, redirecting to login');
      router.push('/login');
      return;
    }

    // If authenticated, allow access
    setIsAuthenticated(true);
  }, [pathname, router]);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
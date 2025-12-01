"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const token = localStorage.getItem("authToken");
      
      console.log('🔐 AuthGate checking token on:', pathname);
      console.log('🔐 Token found:', token ? 'YES ✅' : 'NO ❌');
      
      if (!token) {
        console.log('❌ No token, redirecting to login');
        // Remember where user wanted to go
        const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
        router.replace(`/login${next}`);
      } else {
        console.log('✅ Token found, allowing access to:', pathname);
        setIsAuthenticated(true);
      }
      
      setIsChecking(false);
    };

    // Small delay to ensure storage is ready after navigation
    const timeout = setTimeout(checkAuth, 150);
    
    return () => clearTimeout(timeout);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
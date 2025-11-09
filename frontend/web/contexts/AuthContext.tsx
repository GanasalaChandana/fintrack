// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI, getToken, clearToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  // Redirect logic
  useEffect(() => {
    if (!isLoading) {
      if (!user && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        console.log('🔒 Not authenticated, redirecting to login');
        router.push('/login');
      } else if (user && isPublicRoute) {
        // Authenticated but on public route
        console.log('✅ Already authenticated, redirecting to dashboard');
        router.push('/dashboard');
      }
    }
  }, [user, isLoading, pathname, isPublicRoute]);

  const loadUser = async () => {
    const token = getToken();
    
    if (!token) {
      console.log('❌ No token found');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading user with token:', token.substring(0, 20) + '...');
      const userData = await authAPI.getCurrentUser();
      console.log('✅ User loaded:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('❌ Failed to load user:', error);
      
      // Clear invalid token
      if (error.status === 401 || error.status === 403) {
        console.log('🗑️ Clearing invalid token');
        clearToken();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authAPI.login({ email, password });
      console.log('✅ Login successful:', response);
      
      // authAPI.login already stores the token
      // Now load the user data
      await loadUser();
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 Logging out');
    authAPI.logout();
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
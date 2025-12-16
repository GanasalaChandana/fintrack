// services/alert.service.ts
import { getToken } from '@/lib/api';

export interface BudgetAlert {
  id: string;
  budgetId: string;
  userId: string;
  type: 'WARNING_80' | 'WARNING_90' | 'EXCEEDED_100';
  percentage: number;
  currentSpent: number;
  budgetAmount: number;
  category: string;
  acknowledged: boolean;
  createdAt: string;
}

// 🛡️ Helper to check if we're on a public/auth route
function isPublicRoute(): boolean {
  if (typeof window === 'undefined') return true;
  
  const path = window.location.pathname;
  const publicPaths = ['/', '/login', '/register', '/signin', '/signup'];
  
  // Check exact match
  if (publicPaths.includes(path)) return true;
  
  // Check if starts with public path
  return publicPaths.some(p => path.startsWith(`${p}/`) || path.startsWith(`${p}?`));
}

// Helper to get alerts API URL
function getAlertsApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return `${baseUrl}${endpoint}`;
}

// Helper for alerts API requests
async function alertsApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // 🛡️ CRITICAL: Block requests on public routes
  if (isPublicRoute()) {
    console.log('🚫 Blocked API request on public route:', window.location.pathname);
    throw new Error('Cannot make API request on public route');
  }

  const url = getAlertsApiUrl(endpoint);
  const token = getToken();

  // 🛡️ Block requests without token
  if (!token) {
    console.log('🚫 No authentication token - skipping API request');
    throw new Error('No authentication token');
  }

  console.log('📡 Making request to:', url, '- Token present:', !!token);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Requested-With': 'XMLHttpRequest',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'omit',
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - clearing auth data');
        
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('ft_token');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          console.log('🔄 Auth tokens cleared');
        }
        
        throw new Error('Unauthorized - please log in again');
      }
      
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    }

    return {} as T;
  } catch (error) {
    console.error('❌ API request failed:', error);
    throw error;
  }
}

export const alertService = {
  async getAlerts(): Promise<BudgetAlert[]> {
    try {
      // 🛡️ CRITICAL: Don't make request on public routes
      if (isPublicRoute()) {
        console.log('⏭️ Skipping getAlerts - on public route');
        return [];
      }

      // 🛡️ Check for token before making request
      const token = getToken();
      if (!token) {
        console.log('⏭️ No token - returning empty alerts array');
        return [];
      }

      const response = await alertsApiRequest<BudgetAlert[]>('/api/alerts', {
        method: 'GET',
      });
      
      console.log('✅ Successfully fetched alerts:', response.length);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.log('⚠️ Failed to fetch alerts (returning empty array):', error);
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      // 🛡️ Check for token before making request
      const token = getToken();
      if (!token) {
        console.error('Cannot acknowledge alert: no authentication token');
        throw new Error('Not authenticated');
      }

      await alertsApiRequest(`/api/alerts/${alertId}/acknowledge`, {
        method: 'POST',
      });
      
      console.log('✅ Alert acknowledged:', alertId);
    } catch (error) {
      console.error('❌ Failed to acknowledge alert:', error);
      throw error;
    }
  },

  async acknowledgeAll(): Promise<void> {
    try {
      // 🛡️ Check for token before making request
      const token = getToken();
      if (!token) {
        console.error('Cannot acknowledge alerts: no authentication token');
        throw new Error('Not authenticated');
      }

      await alertsApiRequest('/api/alerts/acknowledge-all', {
        method: 'POST',
      });
      
      console.log('✅ All alerts acknowledged');
    } catch (error) {
      console.error('❌ Failed to acknowledge all alerts:', error);
      throw error;
    }
  },
};
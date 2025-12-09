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

// Helper to get alerts API URL
function getAlertsApiUrl(endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_ALERTS_API_URL || 'http://localhost:8083';
  return `${baseUrl}${endpoint}`;
}

// Helper for alerts API requests
async function alertsApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = getAlertsApiUrl(endpoint);
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return {} as T;
}

export const alertService = {
  async getAlerts(): Promise<BudgetAlert[]> {
    try {
      const response = await alertsApiRequest<BudgetAlert[]>('/api/alerts', {
        method: 'GET',
      });
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  },

  async acknowledgeAlert(alertId: string): Promise<void> {
    await alertsApiRequest(`/api/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  },

  async acknowledgeAll(): Promise<void> {
    await alertsApiRequest('/api/alerts/acknowledge-all', {
      method: 'POST',
    });
  },
};

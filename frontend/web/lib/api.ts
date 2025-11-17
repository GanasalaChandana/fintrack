// lib/api.ts
// Centralized API helper for all backend calls

/**
 * User interface for type safety
 */
interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

/**
 * Auth response interface
 */
interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

/**
 * Transaction interface
 */
interface Transaction {
  id?: string;
  date: string;
  description: string;
  merchant: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  [key: string]: any;
}

/**
 * Get the base API URL, ensuring no trailing slash
 */
function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  return url.replace(/\/$/, '');
}

/**
 * Build API endpoint URL
 */
function buildApiUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

/**
 * Token management utilities
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

// ✅ ADD REQUEST TRACKING TO PREVENT DUPLICATES
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Make an API request with automatic error handling and duplicate prevention
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const url = buildApiUrl(endpoint);
  
  // ✅ CREATE UNIQUE REQUEST KEY
  const requestKey = `${options.method || 'GET'}-${endpoint}-${JSON.stringify(options.body || '')}`;
  
  // ✅ CHECK IF THIS EXACT REQUEST IS ALREADY IN FLIGHT
  if (pendingRequests.has(requestKey)) {
    console.log('Duplicate request detected, returning existing promise:', requestKey);
    return pendingRequests.get(requestKey)!;
  }
  
  console.log('API Request:', {
    endpoint,
    url,
    method: options.method || 'GET',
    hasToken: !!token
  });

  const isFormData = options.body instanceof FormData;
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...((!isFormData) && { 'Content-Type': 'application/json' }),
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  // ✅ CREATE AND STORE THE PROMISE
  const requestPromise = (async () => {
    try {
      const response = await fetch(url, config);
      
      // Handle empty responses
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          throw new Error('Server returned an invalid response');
        }
      } else {
        const text = await response.text();
        console.warn('Non-JSON response received:', text);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${text}`);
        }
        
        data = { message: text };
      }

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        
        const errorMessage = data?.message || data?.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Error:', {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    } finally {
      // ✅ CLEAN UP THE PENDING REQUEST
      pendingRequests.delete(requestKey);
    }
  })();

  // ✅ STORE THE PROMISE
  pendingRequests.set(requestKey, requestPromise);
  
  return requestPromise;
}

/**
 * Auth API namespace
 */
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) setToken(response.token);
    if (response.user) setUser(response.user);
    
    return response;
  },

  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) setToken(response.token);
    if (response.user) setUser(response.user);
    
    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      removeToken();
    }
  },

  getCurrentUser: (): Promise<User> =>
    apiRequest<User>('/api/auth/me', {
      method: 'GET',
    }),

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    });
    
    if (response.token) setToken(response.token);
    
    return response;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiRequest<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    if (response) setUser(response);
    
    return response;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Transactions API namespace
 */
export const transactionsAPI = {
  getAll: (filters?: Record<string, string | number>): Promise<Transaction[]> => {
    const params = new URLSearchParams(
      filters ? Object.entries(filters).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>) : {}
    );
    const endpoint = params.toString() ? `/api/transactions?${params}` : '/api/transactions';
    return apiRequest<Transaction[]>(endpoint, { method: 'GET' });
  },

  getById: (id: string): Promise<Transaction> =>
    apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: 'GET',
    }),

  create: (transaction: Omit<Transaction, 'id'>): Promise<Transaction> =>
    apiRequest<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),

  update: (id: string, transaction: Partial<Transaction>): Promise<Transaction> =>
    apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),

  uploadCsv: async (file: File): Promise<{ 
    imported: number; 
    failed: number; 
    message: string 
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest('/api/transactions/upload', {
      method: 'POST',
      body: formData,
    });
  },

  exportCsv: async (filters?: Record<string, string>): Promise<Blob> => {
    const params = new URLSearchParams(filters || {});
    const endpoint = params.toString() ? `/api/transactions/export?${params}` : '/api/transactions/export';
    
    const token = getToken();
    const url = buildApiUrl(endpoint);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to export transactions');
    }
    
    return response.blob();
  },
};

/**
 * Budget API namespace
 */
export const budgetAPI = {
  getAll: (): Promise<any[]> =>
    apiRequest('/api/budgets', { method: 'GET' }),

  getById: (id: string): Promise<any> =>
    apiRequest(`/api/budgets/${id}`, { method: 'GET' }),

  create: (budget: any): Promise<any> =>
    apiRequest('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    }),

  update: (id: string, budget: any): Promise<any> =>
    apiRequest(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/budgets/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Reports API namespace
 */
export const reportsAPI = {
  getOverview: (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const endpoint = params.toString() ? `/api/reports/overview?${params}` : '/api/reports/overview';
    return apiRequest(endpoint, { method: 'GET' });
  },

  getByCategory: (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const endpoint = params.toString() ? `/api/reports/category?${params}` : '/api/reports/category';
    return apiRequest(endpoint, { method: 'GET' });
  },

  getTrends: (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<any> =>
    apiRequest(`/api/reports/trends?period=${period}`, { method: 'GET' }),
};

/**
 * Health API namespace
 */
export const healthAPI = {
  check: (): Promise<{ status: string; timestamp: string }> =>
    apiRequest('/api/health', { method: 'GET' }),

  ping: (): Promise<{ message: string }> =>
    apiRequest('/api/health/ping', { method: 'GET' }),
};

/**
 * Default API object with HTTP methods
 */
const api = {
  get: <T = any>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    }),
  
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: <T = any>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
  
  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit): Promise<T> =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export default api;

// Export types
export type { User, AuthResponse, Transaction };
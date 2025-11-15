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
 * Services should include /api in their endpoint paths
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

/**
 * Make an API request with automatic error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const url = buildApiUrl(endpoint);
  
  console.log('API Request:', {
    endpoint,
    url,
    method: options.method || 'GET',
    hasToken: !!token
  });

  // Don't set Content-Type for FormData (browser will set it with boundary)
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

  try {
    const response = await fetch(url, config);
    
    // Handle empty responses (like 204 No Content)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        
        // If response is not ok and we can't parse JSON, throw generic error
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        throw new Error('Server returned an invalid response');
      }
    } else {
      // Non-JSON response (could be text, html, etc.)
      const text = await response.text();
      console.warn('Non-JSON response received:', text);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }
      
      // Return text as data
      data = { message: text };
    }

    // Handle HTTP errors
    if (!response.ok) {
      // Check for specific status codes
      if (response.status === 401) {
        // Unauthorized - clear tokens and redirect
        removeToken();
        
        // Only redirect if we're in the browser and not already on login page
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
    
    // Re-throw the error so calling code can handle it
    throw error;
  }
}

/**
 * Auth API namespace
 */
export const authApi = {
  /**
   * Register a new user
   */
  register: async (userData: { name: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) setToken(response.token);
    if (response.user) setUser(response.user);
    
    return response;
  },

  /**
   * Login with email and password
   */
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) setToken(response.token);
    if (response.user) setUser(response.user);
    
    return response;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Even if the API call fails, clear local data
      console.error('Logout API error:', error);
    } finally {
      // Always remove token locally
      removeToken();
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: (): Promise<User> =>
    apiRequest<User>('/api/auth/me', {
      method: 'GET',
    }),

  /**
   * Refresh authentication token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    });
    
    if (response.token) setToken(response.token);
    
    return response;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiRequest<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    
    if (response) setUser(response);
    
    return response;
  },

  /**
   * Change password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

/**
 * Transactions API namespace
 */
export const transactionsApi = {
  /**
   * Get all transactions with optional filters
   */
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

  /**
   * Get a single transaction by ID
   */
  getById: (id: string): Promise<Transaction> =>
    apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: 'GET',
    }),

  /**
   * Create a new transaction
   */
  create: (transaction: Omit<Transaction, 'id'>): Promise<Transaction> =>
    apiRequest<Transaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),

  /**
   * Update an existing transaction
   */
  update: (id: string, transaction: Partial<Transaction>): Promise<Transaction> =>
    apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    }),

  /**
   * Delete a transaction
   */
  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),

  /**
   * Upload CSV file with transactions
   */
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

  /**
   * Export transactions as CSV
   */
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
export const budgetApi = {
  /**
   * Get all budgets
   */
  getAll: (): Promise<any[]> =>
    apiRequest('/api/budgets', { method: 'GET' }),

  /**
   * Get a single budget by ID
   */
  getById: (id: string): Promise<any> =>
    apiRequest(`/api/budgets/${id}`, { method: 'GET' }),

  /**
   * Create a new budget
   */
  create: (budget: any): Promise<any> =>
    apiRequest('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    }),

  /**
   * Update an existing budget
   */
  update: (id: string, budget: any): Promise<any> =>
    apiRequest(`/api/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    }),

  /**
   * Delete a budget
   */
  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/budgets/${id}`, {
      method: 'DELETE',
    }),
};

/**
 * Reports API namespace
 */
export const reportsApi = {
  /**
   * Get overview/summary report
   */
  getOverview: (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const endpoint = params.toString() ? `/api/reports/overview?${params}` : '/api/reports/overview';
    return apiRequest(endpoint, { method: 'GET' });
  },

  /**
   * Get spending by category
   */
  getByCategory: (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const endpoint = params.toString() ? `/api/reports/category?${params}` : '/api/reports/category';
    return apiRequest(endpoint, { method: 'GET' });
  },

  /**
   * Get spending trends
   */
  getTrends: (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<any> =>
    apiRequest(`/api/reports/trends?period=${period}`, { method: 'GET' }),
};

/**
 * Health API namespace
 */
export const healthApi = {
  /**
   * Check API health
   */
  check: (): Promise<{ status: string; timestamp: string }> =>
    apiRequest('/api/health', { method: 'GET' }),

  /**
   * Ping API
   */
  ping: (): Promise<{ message: string }> =>
    apiRequest('/api/health/ping', { method: 'GET' }),
};

/**
 * Default API object with HTTP methods
 * This provides api.get(), api.post(), api.put(), api.delete()
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

// Export both naming conventions for backward compatibility
export { authApi as authAPI };
export { transactionsApi as transactionsAPI };
export { healthApi as healthAPI };
export { budgetApi as budgetAPI };
export { reportsApi as reportsAPI };

// Export the api object as default
export default api;

// Export types for use in other files
export type { User, AuthResponse, Transaction };
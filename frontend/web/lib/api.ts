// lib/api.ts
// Centralized API helper for all backend calls

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

export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function setUser(user: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
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
    method: options.method || 'GET'
  });

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, config);
    
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Server returned an invalid response');
    }

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Auth API namespace
 */
export const authApi = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) setToken(response.token);
    if (response.user) setUser(response.user);
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) setToken(response.token);
    if (response.user) setUser(response.user);
    
    return response;
  },

  logout: () => {
    removeToken();
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: () =>
    apiRequest('/api/auth/me', {
      method: 'GET',
    }),
};

/**
 * Transactions API namespace
 */
export const transactionsApi = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams(filters || {});
    const endpoint = params.toString() ? `/api/transactions?${params}` : '/api/transactions';
    return apiRequest(endpoint, { method: 'GET' });
  },

  create: (transaction: any) =>
    apiRequest('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction),
    }),

  update: (id: string, transaction: any) =>
    apiRequest(`/api/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction),
    }),

  delete: (id: string) =>
    apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),

  uploadCsv: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest('/api/transactions/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};

/**
 * Health API namespace
 */
export const healthApi = {
  check: () => apiRequest('/api/health', { method: 'GET' }),
  ping: () => apiRequest('/api/health/ping', { method: 'GET' }),
};

/**
 * Default API object with HTTP methods
 * This provides api.get(), api.post(), api.put(), api.delete()
 */
const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

// Export both naming conventions for backward compatibility
export { authApi as authAPI };
export { transactionsApi as transactionsAPI };
export { healthApi as healthAPI };

// Export the api object as default
export default api;
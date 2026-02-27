// lib/api.ts - Complete fixed version with proper port routing

// =====================
// Types
// =====================

export interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
  message?: string;
}

export interface Transaction {
  id?: string;
  date: string;
  description: string;
  merchant?: string;
  category: string;
  type: "income" | "expense" | "INCOME" | "EXPENSE";
  amount: number;
  userId?: string;
  recurring?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface Budget {
  id?: string;
  category: string;
  budget: number;
  spent: number;
  icon: string;
  color: string;
  month?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetSummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  budgets: Budget[];
}

export interface Alert {
  id?: string;
  type: "budget_exceeded" | "goal_milestone" | "unusual_spending" | "bill_reminder" | "low_balance" | "achievement";
  title: string;
  message: string;
  severity: "info" | "warning" | "error" | "success";
  read: boolean;
  actionUrl?: string;
  metadata?: {
    budgetId?: string;
    goalId?: string;
    transactionId?: string;
    amount?: number;
    category?: string;
    [key: string]: any;
  };
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================
// Base URL helpers
// =====================

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const cleanUrl = url.replace(/\/$/, "");
  console.log('🌐 Using API Gateway URL:', cleanUrl);
  return cleanUrl;
}

function getTransactionsUrl(): string {
  // IMPORTANT: Transactions are on port 8082
  const envUrl = process.env.NEXT_PUBLIC_TRANSACTIONS_API_URL;
  const url = envUrl || "http://localhost:8082";
  const cleanUrl = url.replace(/\/$/, "");
  console.log('💰 Using Transactions Service URL:', cleanUrl);
  return cleanUrl;
}

function buildApiUrl(endpoint: string, useTransactionsService: boolean = false): string {
  const baseUrl = useTransactionsService ? getTransactionsUrl() : getBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// =====================
// Auth token helpers
// =====================

const PRIMARY_TOKEN_KEY = "authToken";
const LEGACY_TOKEN_KEY = "ft_token";
const REFRESH_TOKEN_KEY = "refreshToken";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const token = 
    localStorage.getItem(PRIMARY_TOKEN_KEY) || 
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    sessionStorage.getItem(PRIMARY_TOKEN_KEY) ||
    getCookieToken();
  
  if (!token) {
    console.warn('⚠️ No token found in any storage location');
  } else {
    console.log('✅ Token found:', token.substring(0, 20) + '...');
  }
  
  return token || null;
}

function getCookieToken(): string | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(row => row.startsWith(`${PRIMARY_TOKEN_KEY}=`));
  
  return tokenCookie ? tokenCookie.split('=')[1] : null;
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  
  console.log('🔐 Setting token in all storage locations');
  
  localStorage.setItem(PRIMARY_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  sessionStorage.setItem(PRIMARY_TOKEN_KEY, token);
  
  document.cookie = `${PRIMARY_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  
  console.log('✅ Token stored successfully');
}

export function removeToken(): void {
  if (typeof window === "undefined") return;

  console.log('🗑️ Removing all tokens and user data');

  localStorage.removeItem(PRIMARY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("user");
  localStorage.removeItem("userId");

  sessionStorage.removeItem(PRIMARY_TOKEN_KEY);

  document.cookie = `${PRIMARY_TOKEN_KEY}=; path=/; max-age=0`;

  console.log('✅ All tokens removed');
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("❌ Error parsing user from localStorage:", error);
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
  
  if (user.id) {
    localStorage.setItem("userId", user.id.toString());
  }
  
  console.log('✅ User saved to localStorage:', user.email);
}

export function isAuthenticated(): boolean {
  const hasToken = !!getToken();
  console.log('🔐 Authentication check:', hasToken ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
  return hasToken;
}

// =====================
// Generic API helper
// =====================

const pendingRequests = new Map<string, Promise<any>>();

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  useTransactionsService: boolean = false
): Promise<T> {
  const url = buildApiUrl(endpoint, useTransactionsService);
  const token = getToken();

  console.log(`
┌─────────────────────────────────────────
│ 🌐 API REQUEST
├─────────────────────────────────────────
│ Method:   ${options.method || 'GET'}
│ Endpoint: ${endpoint}
│ URL:      ${url}
│ Service:  ${useTransactionsService ? 'Transactions (8082)' : 'Gateway (8080)'}
│ Token:    ${token ? '✅ Present' : '❌ Missing'}
└─────────────────────────────────────────
  `);

  const requestKey = `${options.method || "GET"}-${endpoint}-${JSON.stringify(options.body || "")}`;

  if (pendingRequests.has(requestKey)) {
    console.log('♻️ Returning cached request for:', endpoint);
    return pendingRequests.get(requestKey)!;
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && { "Content-Type": "application/json" }),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, config);

      console.log(`
┌─────────────────────────────────────────
│ 📥 API RESPONSE
├─────────────────────────────────────────
│ Endpoint: ${endpoint}
│ Status:   ${response.status} ${response.statusText}
│ OK:       ${response.ok ? '✅' : '❌'}
└─────────────────────────────────────────
      `);

      const contentType = response.headers.get("content-type") || "";
      let data: any = undefined;

      if (response.status === 204 || response.headers.get("content-length") === "0") {
        return {} as T;
      }

      const text = await response.text();

      if (text && contentType.includes("application/json")) {
        try {
          data = JSON.parse(text);
        } catch (err) {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
          }
          throw new Error("Invalid JSON from server");
        }
      } else if (text) {
        data = text;
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Attempt silent token refresh before redirecting to login
          const storedRefreshToken = getRefreshToken();
          if (storedRefreshToken && !endpoint.includes('/auth/refresh')) {
            try {
              console.log('🔄 Attempting silent token refresh...');
              const refreshUrl = buildApiUrl('/api/auth/refresh', false);
              const refreshResponse = await fetch(refreshUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: storedRefreshToken }),
                credentials: 'include',
              });

              if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                if (refreshData.token) {
                  setToken(refreshData.token);
                  if (refreshData.refreshToken) setRefreshToken(refreshData.refreshToken);
                  console.log('✅ Token refreshed successfully, retrying original request');

                  // Retry the original request with the new token
                  const retryResponse = await fetch(url, {
                    ...config,
                    headers: {
                      ...config.headers as Record<string, string>,
                      Authorization: `Bearer ${refreshData.token}`,
                    },
                  });

                  if (retryResponse.ok) {
                    const retryText = await retryResponse.text();
                    if (!retryText) return {} as T;
                    const retryContentType = retryResponse.headers.get('content-type') || '';
                    if (retryContentType.includes('application/json')) {
                      return JSON.parse(retryText) as T;
                    }
                    return retryText as unknown as T;
                  }
                }
              }
            } catch (refreshError) {
              console.warn('⚠️ Token refresh failed:', refreshError);
            }
          }

          removeToken();

          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.location.href = '/register?mode=signin&reason=session_expired';
            }, 100);
          }
        }

        const errorMessage =
          (data && typeof data === "object" && (data.message || data.error)) ||
          (typeof data === "string" && data) ||
          `HTTP error! status: ${response.status}`;

        throw new Error(errorMessage);
      }

      return data as T;
      
    } catch (error: any) {
      console.error(`❌ API ERROR: ${error.message}`);
      throw error;
    } finally {
      pendingRequests.delete(requestKey);
    }
  })();

  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}

// =====================
// Auth API
// =====================

export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }, false);

    if (response.token) setToken(response.token);
    if (response.refreshToken) setRefreshToken(response.refreshToken);
    if (response.user) setUser(response.user);

    return response;
  },

  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }, false);

    if (response.token) setToken(response.token);
    if (response.refreshToken) setRefreshToken(response.refreshToken);
    if (response.user) setUser(response.user);

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" }, false);
    } catch (error) {
      console.error("❌ Logout API error:", error);
    } finally {
      removeToken();
    }
  },

  getCurrentUser: (): Promise<User> => {
    return apiRequest<User>("/api/auth/me", { method: "GET" }, false);
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const storedRefreshToken = getRefreshToken();
    const response = await apiRequest<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    }, false);

    if (response.token) setToken(response.token);
    if (response.refreshToken) setRefreshToken(response.refreshToken);
    return response;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiRequest<User>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    }, false);

    if (response) setUser(response);
    return response;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return apiRequest("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }, false);
  },
};

// =====================
// Transactions API - FIXED TO USE PORT 8082
// =====================

export const transactionsAPI = {
  getAll: async (filters?: Record<string, string | number>): Promise<Transaction[]> => {
    const params = new URLSearchParams(
      filters
        ? Object.entries(filters).reduce<Record<string, string>>((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {})
        : {}
    );

    const endpoint = params.toString()
      ? `/api/transactions?${params}`
      : "/api/transactions";

    try {
      console.log('🔍 Fetching transactions from service on port 8082...');
      
      // Use apiRequest with useTransactionsService=true
      const data = await apiRequest<Transaction[] | any>(endpoint, {
        method: "GET",
      }, true); // THIS IS THE KEY FIX - set to true to use port 8082

      let transactions: Transaction[];
      
      if (Array.isArray(data)) {
        transactions = data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.transactions)) {
          transactions = data.transactions;
        } else if (Array.isArray(data.data)) {
          transactions = data.data;
        } else if (Array.isArray(data.content)) {
          transactions = data.content;
        } else {
          console.error("Unexpected response format:", data);
          return [];
        }
      } else {
        return [];
      }

      console.log(`✅ Fetched ${transactions.length} transactions from API`);
      return transactions;
      
    } catch (error: any) {
      console.error("❌ Error fetching transactions:", error);
      return [];
    }
  },

  getById: async (id: string): Promise<Transaction> => {
    return apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: "GET",
    }, true); // Use transactions service
  },

  create: async (transaction: Omit<Transaction, "id">): Promise<Transaction> => {
    return apiRequest<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    }, true); // Use transactions service
  },

  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    return apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transaction),
    }, true); // Use transactions service
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/api/transactions/${id}`, {
      method: "DELETE",
    }, true); // Use transactions service
  },

  exportCsv: async (): Promise<Blob> => {
    const url = buildApiUrl("/api/transactions/export", true);
    const token = getToken();
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to export transactions");
    }

    return response.blob();
  },
};

// =====================
// Budgets API
// =====================

export const budgetsAPI = {
  getAll: async (month?: string): Promise<Budget[]> => {
    const params = month ? `?month=${month}` : "";
    
    try {
      const data = await apiRequest<Budget[] | any>(`/api/budgets${params}`, { 
        method: "GET" 
      }, false);

      if (Array.isArray(data)) {
        console.log(`✅ Fetched ${data.length} budgets`);
        return data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.budgets)) return data.budgets;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.content)) return data.content;
      }
      
      console.warn("⚠️ Unexpected budgets response format, returning empty array");
      return [];
    } catch (error: any) {
      console.error("❌ Error fetching budgets:", error);
      return [];
    }
  },

  getById: (id: string): Promise<Budget> =>
    apiRequest<Budget>(`/api/budgets/${id}`, { method: "GET" }, false),

  create: (budget: Omit<Budget, "id">): Promise<Budget> =>
    apiRequest<Budget>("/api/budgets", {
      method: "POST",
      body: JSON.stringify(budget),
    }, false),

  update: (id: string, budget: Partial<Budget>): Promise<Budget> =>
    apiRequest<Budget>(`/api/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(budget),
    }, false),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/budgets/${id}`, { method: "DELETE" }, false),

  updateSpent: (id: string, spent: number): Promise<Budget> =>
    apiRequest<Budget>(`/api/budgets/${id}/spent`, {
      method: "PATCH",
      body: JSON.stringify({ spent }),
    }, false),

  getSummary: (month?: string): Promise<BudgetSummary> => {
    const params = month ? `?month=${month}` : "";
    return apiRequest<BudgetSummary>(`/api/budgets/summary${params}`, {
      method: "GET",
    }, false);
  },
};

// =====================
// Alerts API
// =====================

export const alertsAPI = {
  getAll: async (): Promise<Alert[]> => {
    try {
      const data = await apiRequest<Alert[] | any>("/api/alerts", {
        method: "GET",
      }, false);

      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object') {
        if (Array.isArray(data.alerts)) return data.alerts;
        if (Array.isArray(data.data)) return data.data;
        if (Array.isArray(data.content)) return data.content;
      }
      
      return [];
    } catch (error: any) {
      console.error("❌ Error fetching alerts:", error);
      return [];
    }
  },

  getUnread: async (): Promise<Alert[]> => {
    try {
      const data = await apiRequest<Alert[] | any>("/api/alerts/unread", {
        method: "GET",
      }, false);

      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object' && Array.isArray(data.alerts)) return data.alerts;
      
      return [];
    } catch (error) {
      console.error("❌ Error fetching unread alerts:", error);
      return [];
    }
  },

  getById: (id: string): Promise<Alert> =>
    apiRequest<Alert>(`/api/alerts/${id}`, { method: "GET" }, false),

  create: (alert: Omit<Alert, "id">): Promise<Alert> =>
    apiRequest<Alert>("/api/alerts", {
      method: "POST",
      body: JSON.stringify(alert),
    }, false),

  markAsRead: (id: string): Promise<Alert> =>
    apiRequest<Alert>(`/api/alerts/${id}/read`, {
      method: "PATCH",
    }, false),

  markAllAsRead: (): Promise<{ message: string; count: number }> =>
    apiRequest("/api/alerts/mark-all-read", {
      method: "PATCH",
    }, false),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/alerts/${id}`, { method: "DELETE" }, false),

  deleteAll: (): Promise<{ message: string; count: number }> =>
    apiRequest("/api/alerts", { method: "DELETE" }, false),
};

// =====================
// Notifications API
// =====================

export const notificationsAPI = {
  getAllForUser: async (userId: string): Promise<Notification[]> => {
    try {
      const data = await apiRequest<Notification[] | any>(
        `/api/notifications/user/${userId}`,
        { method: "GET" },
        false
      );

      if (Array.isArray(data)) {
        console.log(`✅ Fetched ${data.length} notifications`);
        return data;
      } else if (data && typeof data === 'object' && Array.isArray(data.notifications)) {
        console.log(`✅ Fetched ${data.notifications.length} notifications`);
        return data.notifications;
      }
      
      console.warn("⚠️ Unexpected notifications response format, returning empty array");
      return [];
    } catch (error: any) {
      console.error("❌ Error fetching notifications:", error);
      return [];
    }
  },

  markAsRead: (id: string, userId: string): Promise<Notification> =>
    apiRequest<Notification>(`/api/notifications/${id}/read?userId=${userId}`, {
      method: "PATCH",
    }, false),

  markAllAsRead: (userId: string): Promise<{ message: string }> =>
    apiRequest(`/api/notifications/user/${userId}/read-all`, {
      method: "PATCH",
    }, false),

  delete: (id: string, userId: string): Promise<{ message: string }> =>
    apiRequest(`/api/notifications/${id}?userId=${userId}`, {
      method: "DELETE",
    }, false),
};

// =====================
// Reports API
// =====================

export const reportsAPI = {
  getOverview: (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const endpoint = params.toString()
      ? `/api/reports/overview?${params}`
      : "/api/reports/overview";
    return apiRequest(endpoint, { method: "GET" }, false);
  },

  getByCategory: (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const endpoint = params.toString()
      ? `/api/reports/category?${params}`
      : "/api/reports/category";
    return apiRequest(endpoint, { method: "GET" }, false);
  },

  getTrends: (
    period: "daily" | "weekly" | "monthly" | "yearly" = "monthly"
  ): Promise<any> =>
    apiRequest(`/api/reports/trends?period=${period}`, { method: "GET" }, false),
};

// =====================
// Health API
// =====================

export const healthAPI = {
  check: (): Promise<{ status: string; timestamp: string }> =>
    apiRequest("/api/health", { method: "GET" }, false),

  ping: (): Promise<{ message: string }> =>
    apiRequest("/api/health/ping", { method: "GET" }, false),
};

// =====================
// Generic API wrapper
// =====================

const api = {
  get: <T = any>(endpoint: string, options?: RequestInit, useTransactionsService?: boolean): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }, useTransactionsService),

  post: <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
    useTransactionsService?: boolean
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body:
        body instanceof FormData
          ? body
          : body
          ? JSON.stringify(body)
          : undefined,
    }, useTransactionsService),

  put: <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
    useTransactionsService?: boolean
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }, useTransactionsService),

  delete: <T = any>(endpoint: string, options?: RequestInit, useTransactionsService?: boolean): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }, useTransactionsService),

  patch: <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
    useTransactionsService?: boolean
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }, useTransactionsService),
};

export default api;
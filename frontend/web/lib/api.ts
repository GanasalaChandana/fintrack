// lib/api.ts - Goals API removed

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
  user: User;
  message?: string;
}

export interface Transaction {
  id?: string;
  date: string;
  description: string;
  merchant: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  userId?: string;
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

// =====================
// Base URL helpers
// =====================

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  return url.replace(/\/$/, "");
}

function buildApiUrl(endpoint: string): string {
  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}

// =====================
// Auth token helpers
// =====================

const PRIMARY_TOKEN_KEY = "authToken";
const LEGACY_TOKEN_KEY = "ft_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  
  const token = 
    localStorage.getItem(PRIMARY_TOKEN_KEY) || 
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    getCookieToken();
  
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
  
  localStorage.setItem(PRIMARY_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  
  document.cookie = `${PRIMARY_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(PRIMARY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem("user");
  
  document.cookie = `${PRIMARY_TOKEN_KEY}=; path=/; max-age=0`;
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// =====================
// Generic API helper
// =====================

const pendingRequests = new Map<string, Promise<any>>();

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);
  const token = getToken();

  // Prevent duplicate requests
  const requestKey = `${options.method || "GET"}-${endpoint}-${JSON.stringify(options.body || "")}`;

  if (pendingRequests.has(requestKey)) {
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

      const contentType = response.headers.get("content-type") || "";
      let data: any = undefined;

      if (contentType.includes("application/json")) {
        const text = await response.text();
        
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (err) {
            console.error("Failed to parse JSON:", err);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            throw new Error("Invalid JSON from server");
          }
        }
      } else {
        const text = await response.text();
        data = text || undefined;
      }

      // Handle HTTP errors
      if (!response.ok) {
        if (response.status === 401) {
          removeToken();
          
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.location.href = '/register?mode=signin';
            }, 100);
          }
        }

        const errorMessage =
          (data && typeof data === "object" && (data.message || data.error)) ||
          (typeof data === "string" && data) ||
          `HTTP error! status: ${response.status}`;

        throw new Error(errorMessage);
      }

      // Handle empty responses
      if (
        response.status === 204 ||
        data === undefined ||
        response.headers.get("content-length") === "0"
      ) {
        return {} as T;
      }

      return data as T;
      
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
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
    });

    if (response.token) setToken(response.token);
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
    });

    if (response.token) setToken(response.token);
    if (response.user) setUser(response.user);

    return response;
  },

  logout: async (): Promise<void> => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      removeToken();
    }
  },

  getCurrentUser: (): Promise<User> =>
    apiRequest<User>("/api/auth/me", { method: "GET" }),

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiRequest<AuthResponse>("/api/auth/refresh", {
      method: "POST",
    });

    if (response.token) setToken(response.token);
    return response;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiRequest<User>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });

    if (response) setUser(response);
    return response;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> =>
    apiRequest("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// =====================
// Transactions API
// =====================

export const transactionsAPI = {
  getAll: async (
    filters?: Record<string, string | number>
  ): Promise<Transaction[]> => {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams(
      filters
        ? Object.entries(filters).reduce((acc, [key, value]) => {
            acc[key] = String(value);
            return acc;
          }, {} as Record<string, string>)
        : {}
    );

    const endpoint = params.toString()
      ? `/api/transactions?${params}`
      : "/api/transactions";

    try {
      const data = await apiRequest<Transaction[] | any>(endpoint, {
        method: "GET",
      });

      // Handle different response formats
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

      return transactions;
      
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      
      if (error.message?.includes("Authentication required")) {
        throw error;
      }
      
      return [];
    }
  },

  getById: (id: string): Promise<Transaction> =>
    apiRequest<Transaction>(`/api/transactions/${id}`, { method: "GET" }),

  create: (transaction: Omit<Transaction, "id">): Promise<Transaction> =>
    apiRequest<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    }),

  update: (id: string, transaction: Partial<Transaction>): Promise<Transaction> =>
    apiRequest<Transaction>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(transaction),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/transactions/${id}`, { method: "DELETE" }),

  exportCsv: async (): Promise<Blob> => {
    const response = await fetch(buildApiUrl("/api/transactions/export"), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
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
  getAll: (month?: string): Promise<Budget[]> => {
    const params = month ? `?month=${month}` : "";
    return apiRequest<Budget[]>(`/api/budgets${params}`, { method: "GET" });
  },

  getById: (id: string): Promise<Budget> =>
    apiRequest<Budget>(`/api/budgets/${id}`, { method: "GET" }),

  create: (budget: Omit<Budget, "id">): Promise<Budget> =>
    apiRequest<Budget>("/api/budgets", {
      method: "POST",
      body: JSON.stringify(budget),
    }),

  update: (id: string, budget: Partial<Budget>): Promise<Budget> =>
    apiRequest<Budget>(`/api/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify(budget),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/budgets/${id}`, { method: "DELETE" }),

  updateSpent: (id: string, spent: number): Promise<Budget> =>
    apiRequest<Budget>(`/api/budgets/${id}/spent`, {
      method: "PATCH",
      body: JSON.stringify({ spent }),
    }),

  getSummary: (month?: string): Promise<BudgetSummary> => {
    const params = month ? `?month=${month}` : "";
    return apiRequest<BudgetSummary>(`/api/budgets/summary${params}`, {
      method: "GET",
    });
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
      });

      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.alerts)) {
          return data.alerts;
        } else if (Array.isArray(data.data)) {
          return data.data;
        } else if (Array.isArray(data.content)) {
          return data.content;
        }
      }
      
      console.warn("Unexpected alerts response format, returning empty array");
      return [];
    } catch (error: any) {
      // Silently fail if backend is not ready yet
      if (error.message?.includes("ERR_CONNECTION_REFUSED") || 
          error.message?.includes("Failed to fetch") ||
          error.message?.includes("NetworkError")) {
        console.warn("⚠️ Alerts service not available, using empty array");
        return [];
      }
      console.error("Error fetching alerts:", error);
      return [];
    }
  },

  getUnread: async (): Promise<Alert[]> => {
    try {
      const data = await apiRequest<Alert[] | any>("/api/alerts/unread", {
        method: "GET",
      });

      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && Array.isArray(data.alerts)) {
        return data.alerts;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching unread alerts:", error);
      return [];
    }
  },

  getById: (id: string): Promise<Alert> =>
    apiRequest<Alert>(`/api/alerts/${id}`, { method: "GET" }),

  create: (alert: Omit<Alert, "id">): Promise<Alert> =>
    apiRequest<Alert>("/api/alerts", {
      method: "POST",
      body: JSON.stringify(alert),
    }),

  markAsRead: (id: string): Promise<Alert> =>
    apiRequest<Alert>(`/api/alerts/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: (): Promise<{ message: string; count: number }> =>
    apiRequest("/api/alerts/mark-all-read", {
      method: "PATCH",
    }),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/alerts/${id}`, { method: "DELETE" }),

  deleteAll: (): Promise<{ message: string; count: number }> =>
    apiRequest("/api/alerts", { method: "DELETE" }),
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
    return apiRequest(endpoint, { method: "GET" });
  },

  getByCategory: (startDate?: string, endDate?: string): Promise<any> => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    const endpoint = params.toString()
      ? `/api/reports/category?${params}`
      : "/api/reports/category";
    return apiRequest(endpoint, { method: "GET" });
  },

  getTrends: (
    period: "daily" | "weekly" | "monthly" | "yearly" = "monthly"
  ): Promise<any> =>
    apiRequest(`/api/reports/trends?period=${period}`, { method: "GET" }),
};

// =====================
// Health API
// =====================

export const healthAPI = {
  check: (): Promise<{ status: string; timestamp: string }> =>
    apiRequest("/api/health", { method: "GET" }),

  ping: (): Promise<{ message: string }> =>
    apiRequest("/api/health/ping", { method: "GET" }),
};

// =====================
// Generic API wrapper
// =====================

const api = {
  get: <T = any>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
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
    }),

  put: <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestInit): Promise<T> =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),

  patch: <T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export default api;
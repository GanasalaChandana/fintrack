// lib/api.ts - FIXED with better token management & transaction handling

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

export interface Goal {
  id?: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: string;
  color: string;
  category: string;
  monthlyContribution: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
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
// Auth token helpers - IMPROVED
// =====================

const PRIMARY_TOKEN_KEY = "authToken";
const LEGACY_TOKEN_KEY = "ft_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  
  // Try multiple sources
  const token = 
    localStorage.getItem(PRIMARY_TOKEN_KEY) || 
    localStorage.getItem(LEGACY_TOKEN_KEY) ||
    getCookieToken();
  
  console.log("🔑 getToken called:", {
    hasLocalStorage: !!localStorage.getItem(PRIMARY_TOKEN_KEY),
    hasLegacy: !!localStorage.getItem(LEGACY_TOKEN_KEY),
    hasCookie: !!getCookieToken(),
    finalToken: token ? `${token.substring(0, 30)}...` : "NONE"
  });
  
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
  
  console.log("💾 Setting token:", {
    length: token?.length,
    preview: token ? `${token.substring(0, 30)}...` : "NONE"
  });
  
  // Store in both localStorage locations
  localStorage.setItem(PRIMARY_TOKEN_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_KEY, token);
  
  // Also set cookie for SSR/middleware
  document.cookie = `${PRIMARY_TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  
  console.log("✅ Token saved to localStorage and cookie");
  
  // Verify it was saved
  const verified = getToken();
  console.log("🔍 Token verification:", !!verified);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  
  console.log("🗑️ Removing token from all locations");
  
  localStorage.removeItem(PRIMARY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem("user");
  
  // Clear cookie
  document.cookie = `${PRIMARY_TOKEN_KEY}=; path=/; max-age=0`;
  
  console.log("✅ Token removed");
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
  console.log("✅ User saved to localStorage:", user.email);
}

export function isAuthenticated(): boolean {
  const token = getToken();
  const hasToken = !!token;
  
  console.log("🔐 isAuthenticated check:", {
    hasToken,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "NONE"
  });
  
  return hasToken;
}

// =====================
// Generic API helper - IMPROVED
// =====================

const pendingRequests = new Map<string, Promise<any>>();

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);
  const token = getToken();

  console.log("📡 API Request:", {
    method: options.method || "GET",
    endpoint,
    url,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 30)}...` : "NONE"
  });

  // Prevent duplicate requests
  const requestKey = `${options.method || "GET"}-${endpoint}-${JSON.stringify(options.body || "")}`;

  if (pendingRequests.has(requestKey)) {
    console.log("⏳ Duplicate request detected, returning cached promise");
    return pendingRequests.get(requestKey)!;
  }

  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(!isFormData && { "Content-Type": "application/json" }),
  };

  // CRITICAL: Always add Authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log("✅ Added Authorization header:", headers.Authorization.substring(0, 50) + "...");
  } else {
    console.warn("⚠️ No token available for request to:", endpoint);
  }

  // Merge with existing headers
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

  console.log("📤 Final request config:", {
    url,
    method: config.method || "GET",
    hasContentType: !!headers["Content-Type"],
    hasAuthorization: !!headers["Authorization"],
    headers: Object.keys(headers)
  });

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, config);

      console.log("📥 Response received:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType: response.headers.get("content-type")
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = undefined;

      if (contentType.includes("application/json")) {
        const text = await response.text();
        console.log("📄 Response text:", text.substring(0, 200));
        
        if (text) {
          try {
            data = JSON.parse(text);
            console.log("✅ Parsed JSON data:", {
              type: typeof data,
              isArray: Array.isArray(data),
              keys: data && typeof data === 'object' ? Object.keys(data) : []
            });
          } catch (err) {
            console.error("❌ Failed to parse JSON:", err, "Raw text:", text);
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
        console.error("❌ HTTP Error:", {
          status: response.status,
          statusText: response.statusText,
          data
        });

        if (response.status === 401) {
          console.error("❌ 401 Unauthorized - clearing token and redirecting");
          removeToken();
          
          // Redirect to login if in browser
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
        console.log("✅ Empty response (204/no-content)");
        return {} as T;
      }

      console.log("✅ Request successful:", endpoint);
      return data as T;
      
    } catch (error) {
      console.error("❌ API Error:", {
        endpoint,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      });
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
// Transactions API - FIXED
// =====================

export const transactionsAPI = {
  // Get all transactions with improved error handling
  getAll: async (
    filters?: Record<string, string | number>
  ): Promise<Transaction[]> => {
    // Verify token before making request
    const token = getToken();
    if (!token) {
      console.error("❌ No token available for transactions request");
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

    console.log("📊 Fetching transactions:", {
      endpoint,
      hasToken: !!token,
      tokenPreview: token.substring(0, 30) + "..."
    });

    try {
      const data = await apiRequest<Transaction[] | any>(endpoint, {
        method: "GET",
      });

      console.log("📦 Raw transaction response:", {
        type: typeof data,
        isArray: Array.isArray(data),
        keys: data && typeof data === 'object' ? Object.keys(data) : [],
        dataPreview: data
      });

      // Handle different response formats
      let transactions: Transaction[];
      
      if (Array.isArray(data)) {
        transactions = data;
        console.log("✅ Got array directly, count:", transactions.length);
      } else if (data && typeof data === 'object') {
        // Try common wrapper properties
        if (Array.isArray(data.transactions)) {
          transactions = data.transactions;
          console.log("✅ Got transactions from .transactions, count:", transactions.length);
        } else if (Array.isArray(data.data)) {
          transactions = data.data;
          console.log("✅ Got transactions from .data, count:", transactions.length);
        } else if (Array.isArray(data.content)) {
          transactions = data.content;
          console.log("✅ Got transactions from .content, count:", transactions.length);
        } else {
          console.error("❌ Unexpected response format:", {
            type: typeof data,
            keys: Object.keys(data),
            data
          });
          return [];
        }
      } else {
        console.error("❌ Expected array or object but got:", typeof data);
        return [];
      }

      return transactions;
      
    } catch (error: any) {
      console.error("❌ Error fetching transactions:", {
        message: error.message,
        stack: error.stack
      });
      
      // If it's an auth error, it will be handled by apiRequest
      // For other errors, return empty array to prevent UI breaking
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
// Goals API
// =====================

export const goalsAPI = {
  getAll: (): Promise<Goal[]> =>
    apiRequest<Goal[]>("/api/goals", { method: "GET" }),

  getById: (id: string): Promise<Goal> =>
    apiRequest<Goal>(`/api/goals/${id}`, { method: "GET" }),

  create: (goal: Omit<Goal, "id">): Promise<Goal> =>
    apiRequest<Goal>("/api/goals", {
      method: "POST",
      body: JSON.stringify(goal),
    }),

  update: (id: string, goal: Partial<Goal>): Promise<Goal> =>
    apiRequest<Goal>(`/api/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(goal),
    }),

  delete: (id: string): Promise<{ message: string }> =>
    apiRequest(`/api/goals/${id}`, { method: "DELETE" }),

  updateProgress: (id: string, current: number): Promise<Goal> =>
    apiRequest<Goal>(`/api/goals/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ current }),
    }),
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
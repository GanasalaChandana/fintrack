// lib/api/index.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/* ============================= Token Management ============================= */
export const getToken = () => {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
};

export const setToken = (t) => { 
  if (typeof window !== "undefined") {
    localStorage.setItem("authToken", t);
  }
};

export const clearToken = () => { 
  if (typeof window !== "undefined") {
    localStorage.removeItem("authToken");
  }
};

/* ============================= API Client ============================= */
class ApiClient {
  constructor(baseURL) { 
    this.baseURL = baseURL;
    this.pendingRequests = new Map(); // Track pending requests
  }

  _authHeaders() { 
    const token = getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    // TEMPORARY: Add mock user ID for development
    if (!token && process.env.NODE_ENV === 'development') {
      headers['X-User-Id'] = 'dev-user-123';
    }
    
    return headers;
  }

  _getCacheKey(url, method) {
    return `${method}:${url}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: options.method || "GET",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json", 
        ...this._authHeaders(), 
        ...(options.headers || {}) 
      },
    };

    if (options.body && config.method !== "GET" && config.method !== "HEAD") {
      config.body = typeof options.body === "string" ? options.body : JSON.stringify(options.body);
    }

    try {
      const res = await fetch(url, config);
      
      if (res.status === 204) return null;

      const ctype = res.headers.get("content-type") || "";
      let data;
      
      if (ctype.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        try { 
          data = JSON.parse(text); 
        } catch { 
          data = { message: text || res.statusText }; 
        }
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          const err = new Error("Authentication required");
          err.status = res.status;
          err.data = data;
          throw err;
        }
        
        const err = new Error(data?.message || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      
      return data;
      
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const netErr = new Error('Network error - cannot connect to server');
        netErr.isNetworkError = true;
        throw netErr;
      }
      throw error;
    }
  }

  get(e, o) { return this.request(e, { ...o, method: "GET" }); }
  post(e, b, o) { return this.request(e, { ...o, method: "POST", body: b }); }
  put(e, b, o) { return this.request(e, { ...o, method: "PUT", body: b }); }
  patch(e, b, o) { return this.request(e, { ...o, method: "PATCH", body: b }); }
  delete(e, o) { return this.request(e, { ...o, method: "DELETE" }); }
}

const api = new ApiClient(API_BASE_URL);
export { api as apiClient, API_BASE_URL, ApiClient };

/* ============================= Auth API ============================= */
export const authAPI = {
  async register(userData) { 
    const r = await api.post("/api/auth/register", userData);
    if (r?.token) setToken(r.token);
    return r;
  },
  
  async login(credentials) { 
    const r = await api.post("/api/auth/login", credentials);
    if (r?.token) {
      setToken(r.token);
    }
    return r;
  },
  
  logout() { 
    clearToken();
  },
  
  async getCurrentUser() { 
    return api.get("/api/auth/me");
  },
  
  isAuthenticated() { 
    return !!getToken();
  },
};

/* ============================= Transactions API ============================= */
export const transactionsAPI = {
  async getAll(params = {}) { 
    const qs = new URLSearchParams(params).toString();
    return api.get(qs ? `/api/transactions?${qs}` : "/api/transactions");
  },
  getById(id) { return api.get(`/api/transactions/${id}`); },
  create(d) { return api.post("/api/transactions", d); },
  update(id, d) { return api.put(`/api/transactions/${id}`, d); },
  delete(id) { return api.delete(`/api/transactions/${id}`); },
  classify(description) { return api.post("/api/transactions/classify", { description }); },
  getSummary(params = {}) { 
    const qs = new URLSearchParams(params).toString();
    return api.get(qs ? `/api/transactions/summary?${qs}` : "/api/transactions/summary");
  },
};

/* ============================= Budgets API ============================= */
export const budgetsAPI = {
  async getAll(params = {}) { 
    const qs = new URLSearchParams(params).toString();
    return api.get(qs ? `/api/budgets?${qs}` : "/api/budgets");
  },
  getById(id) { return api.get(`/api/budgets/${id}`); },
  create(d) { return api.post("/api/budgets", d); },
  update(id, d) { return api.put(`/api/budgets/${id}`, d); },
  delete(id) { return api.delete(`/api/budgets/${id}`); },
  checkStatus(id) { return api.get(`/api/budgets/${id}/status`); },
};

/* ============================= Alerts API ============================= */
export const alertsAPI = {
  getAll() { return api.get("/api/alerts"); },
  getActive() { return api.get("/api/alerts/active"); },
  acknowledge(id) { return api.post(`/api/alerts/${id}/acknowledge`); },
  dismiss(id) { return api.delete(`/api/alerts/${id}`); },
};

/* ============================= Reports API ============================= */
export const reportsAPI = {
  getSpendingByCategory(p = {}) { 
    const qs = new URLSearchParams(p).toString();
    return api.get(qs ? `/api/reports/spending-by-category?${qs}` : "/api/reports/spending-by-category");
  },
  getMonthlyTrends(p = {}) { 
    const qs = new URLSearchParams(p).toString();
    return api.get(qs ? `/api/reports/monthly-trends?${qs}` : "/api/reports/monthly-trends");
  },
  getSummary(startDate, endDate) { 
    const qs = new URLSearchParams({ startDate, endDate }).toString();
    return api.get(`/api/reports/summary?${qs}`);
  },
  getCustomReport(t, p = {}) { 
    const qs = new URLSearchParams(p).toString();
    return api.get(qs ? `/api/reports/${t}?${qs}` : `/api/reports/${t}`);
  },
};

/* ============================= Health API ============================= */
export const healthAPI = {
  async checkGateway() { 
    try { 
      const r = await fetch(`${API_BASE_URL}/actuator/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      return r.ok ? { connected: true, data: await r.json() } : { connected: false, status: r.status };
    } catch (e) { 
      console.error('Gateway check failed:', e);
      return { connected: false, error: e.message };
    }
  },
  
  async checkTransactions() {
    try {
      const r = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'X-User-Id': 'dev-user-123'
        }
      });
      return r.ok ? { connected: true } : { connected: false, status: r.status };
    } catch (e) {
      console.warn('Transactions check failed:', e);
      return { connected: false, error: e.message };
    }
  },
  
  async checkBudgets() {
    try {
      const r = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'X-User-Id': 'dev-user-123'
        }
      });
      return r.ok ? { connected: true } : { connected: false, status: r.status };
    } catch (e) {
      console.warn('Budgets check failed:', e);
      return { connected: false, error: e.message };
    }
  },
  
  async checkAll() { 
    const [gateway, transactions, budgets] = await Promise.allSettled([
      this.checkGateway(), 
      this.checkTransactions(),
      this.checkBudgets()
    ]);
    
    const getResult = (p) => p.status === 'fulfilled' ? p.value : { connected: false, error: p.reason?.message };
    
    return {
      connected: gateway.status === 'fulfilled' && gateway.value.connected,
      gateway: getResult(gateway),
      transactions: getResult(transactions),
      budgets: getResult(budgets)
    };
  },
  
  // Alias for Dashboard compatibility
  checkAllServices() {
    return this.checkAll();
  }
};

export default api;
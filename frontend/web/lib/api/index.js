// lib/api/index.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
const GATEWAY_BASE = API_BASE_URL.replace(/\/api\/?$/, "");

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
export { api as apiClient, API_BASE_URL, GATEWAY_BASE, ApiClient };

/* ============================= Auth API ============================= */
export const authAPI = {
  async register(userData) { 
    const r = await api.post("/auth/register", userData);
    if (r?.token) setToken(r.token);
    return r;
  },
  
  async login(credentials) { 
    const r = await api.post("/auth/login", credentials);
    if (r?.token) {
      setToken(r.token);
    }
    return r;
  },
  
  logout() { 
    clearToken();
  },
  
  async getCurrentUser() { 
    return api.get("/auth/me");
  },
  
  isAuthenticated() { 
    return !!getToken();
  },
};

/* ============================= Transactions API ============================= */
export const transactionsAPI = {
  async getAll(params = {}) { 
    const qs = new URLSearchParams(params).toString();
    return api.get(qs ? `/transactions?${qs}` : "/transactions");
  },
  getById(id) { return api.get(`/transactions/${id}`); },
  create(d) { return api.post("/transactions", d); },
  update(id, d) { return api.put(`/transactions/${id}`, d); },
  delete(id) { return api.delete(`/transactions/${id}`); },
  classify(description) { return api.post("/transactions/classify", { description }); },
  getSummary(params = {}) { 
    const qs = new URLSearchParams(params).toString();
    return api.get(qs ? `/transactions/summary?${qs}` : "/transactions/summary");
  },
};

/* ============================= Budgets API ============================= */
export const budgetsAPI = {
  async getAll(params = {}) { 
    const qs = new URLSearchParams(params).toString();
    return api.get(qs ? `/budgets?${qs}` : "/budgets");
  },
  getById(id) { return api.get(`/budgets/${id}`); },
  create(d) { return api.post("/budgets", d); },
  update(id, d) { return api.put(`/budgets/${id}`, d); },
  delete(id) { return api.delete(`/budgets/${id}`); },
  checkStatus(id) { return api.get(`/budgets/${id}/status`); },
};

/* ============================= Alerts API ============================= */
export const alertsAPI = {
  getAll() { return api.get("/alerts"); },
  getActive() { return api.get("/alerts/active"); },
  acknowledge(id) { return api.post(`/alerts/${id}/acknowledge`); },
  dismiss(id) { return api.delete(`/alerts/${id}`); },
};

/* ============================= Reports API ============================= */
export const reportsAPI = {
  getSpendingByCategory(p = {}) { 
    const qs = new URLSearchParams(p).toString();
    return api.get(qs ? `/reports/spending-by-category?${qs}` : "/reports/spending-by-category");
  },
  getMonthlyTrends(p = {}) { 
    const qs = new URLSearchParams(p).toString();
    return api.get(qs ? `/reports/monthly-trends?${qs}` : "/reports/monthly-trends");
  },
  getSummary(startDate, endDate) { 
    const qs = new URLSearchParams({ startDate, endDate }).toString();
    return api.get(`/reports/summary?${qs}`);
  },
  getCustomReport(t, p = {}) { 
    const qs = new URLSearchParams(p).toString();
    return api.get(qs ? `/reports/${t}?${qs}` : `/reports/${t}`);
  },
};

/* ============================= Health API ============================= */
export const healthAPI = {
  async checkGateway() { 
    try { 
      const r = await fetch(`${GATEWAY_BASE}/actuator/health`, {
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
      // Check by calling the actual endpoint, not /health
      const r = await fetch(`${API_BASE_URL}/transactions`, {
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
      // Check by calling the actual endpoint, not /health
      const r = await fetch(`${API_BASE_URL}/budgets`, {
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
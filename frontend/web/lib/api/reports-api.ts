// lib/api.ts
import axios from 'axios';

// Point to API Gateway instead of individual services
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fintrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fintrack_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types (keep existing types)
export interface GenerateReportRequest {
  userId: string;
  reportType: string;
  startDate: string;
  endDate: string;
  categories?: string[];
  format?: string;
  groupBy?: string;
}

export interface SpendingSummaryResponse {
  userId: string;
  startDate: string;
  endDate: string;
  totalSpending: number;
  totalIncome: number;
  netBalance: number;
  transactionCount: number;
  averageDailySpending: number;
  topCategory: string;
  topCategoryAmount: number;
  categorySummaries: CategorySummary[];
}

export interface CategorySummary {
  category: string;
  amount: number;
  transactionCount: number;
  percentage: number;
}

export interface CategoryBreakdownResponse {
  startDate: string;
  endDate: string;
  categories: CategoryDetail[];
  totalAmount: number;
}

export interface CategoryDetail {
  categoryName: string;
  amount: number;
  transactionCount: number;
  percentageOfTotal: number;
  averageTransactionAmount: number;
  highestTransaction?: number;
  lowestTransaction?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: number;
}

// API Functions
export const authAPI = {
  register: async (data: {
    email: string;
    username: string;
    password: string;
    fullName: string;
  }) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('fintrack_token', response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('fintrack_token');
    window.location.href = '/login';
  },
};

export const transactionAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/transactions');
    return response.data;
  },

  create: async (data: {
    amount: number;
    description: string;
    categoryId?: string;
    date: string;
    type: 'INCOME' | 'EXPENSE';
  }) => {
    const response = await apiClient.post('/api/transactions', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/transactions/${id}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/transactions/${id}`);
    return response.data;
  },

  uploadCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/api/transactions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const categoryAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/categories');
    return response.data;
  },

  create: async (data: {
    name: string;
    type: 'INCOME' | 'EXPENSE';
    color?: string;
  }) => {
    const response = await apiClient.post('/api/categories', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/api/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/categories/${id}`);
    return response.data;
  },
};

export const reportsAPI = {
  getSpendingSummary: async (startDate: string, endDate: string) => {
    const response = await apiClient.get(
      `/api/reports/spending?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  getCategoryBreakdown: async (startDate: string, endDate: string) => {
    const response = await apiClient.get(
      `/api/reports/category-breakdown?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  },

  getMonthlyTrends: async (months: number = 6) => {
    const response = await apiClient.get(`/api/reports/trends?months=${months}`);
    return response.data;
  },

  generateReport: async (request: GenerateReportRequest) => {
    const response = await apiClient.post('/api/reports/generate', request);
    return response.data;
  },
};

export const alertsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/alerts');
    return response.data;
  },

  create: async (data: {
    type: string;
    threshold: number;
    categoryId?: string;
  }) => {
    const response = await apiClient.post('/api/alerts', data);
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await apiClient.put(`/api/alerts/${id}/read`);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/alerts/${id}`);
    return response.data;
  },
};

export const mlAPI = {
  classify: async (description: string, amount: number, merchant?: string) => {
    const response = await apiClient.post('/api/ml/classify', {
      description,
      amount,
      merchant,
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await apiClient.get('/actuator/health');
    return response.data;
  },
};

export default apiClient;






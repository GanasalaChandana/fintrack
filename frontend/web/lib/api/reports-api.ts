import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084/api';

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
    const token = localStorage.getItem('auth_token');
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
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
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
export const reportsApi = {
  // Generate Spending Summary
  generateSpendingSummary: async (
    request: GenerateReportRequest
  ): Promise<ApiResponse<SpendingSummaryResponse>> => {
    const response = await apiClient.post<ApiResponse<SpendingSummaryResponse>>(
      '/reports/generate/spending-summary',
      request
    );
    return response.data;
  },

  // Generate Category Breakdown
  generateCategoryBreakdown: async (
    request: GenerateReportRequest
  ): Promise<ApiResponse<CategoryBreakdownResponse>> => {
    const response = await apiClient.post<ApiResponse<CategoryBreakdownResponse>>(
      '/reports/generate/category-breakdown',
      request
    );
    return response.data;
  },

  // Health Check
  healthCheck: async (): Promise<string> => {
    const response = await apiClient.get<string>('/reports/health');
    return response.data;
  },
};

export default apiClient;
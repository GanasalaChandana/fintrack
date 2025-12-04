// services/reports.service.ts

import { apiRequest, getToken } from "@/lib/api";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084"
).replace(/\/$/, "");

// ---------- Types ----------

export type ReportsRange =
  | "last-7-days"
  | "last-30-days"
  | "last-3-months"
  | "last-6-months"
  | "last-year"
  | "custom";

export interface MonthlyReportData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  target: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  budget: number;
  percentage: number;
  color: string;
}

export interface SavingsGoal {
  name: string;
  current: number;
  target: number;
  progress: number;
  color: string;
}

export interface TopExpense {
  vendor: string;
  category: string;
  amount: number;
  frequency: number;
}

export interface FinancialSummary {
  netIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  incomeChange: number;
  expensesChange: number;
  savingsChange: number;
  savingsRateChange: number;
}

export interface ReportsData {
  summary: FinancialSummary;
  monthlyData: MonthlyReportData[];
  categoryBreakdown: CategoryBreakdown[];
  savingsGoals: SavingsGoal[];
  topExpenses: TopExpense[];
  insights: string[];
}

// ---------- Helpers ----------

const buildUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// ---------- Service ----------

class ReportsService {
  /**
   * Fetch comprehensive financial reports
   */
  async getFinancialReports(
    dateRange: ReportsRange = "last-30-days",
  ): Promise<ReportsData> {
    const endpoint = `/api/reports/financial?range=${encodeURIComponent(
      dateRange,
    )}`;

    // Uses shared apiRequest → automatically attaches Authorization header
    return apiRequest<ReportsData>(endpoint, { method: "GET" });
  }

  /**
   * Fetch monthly summary data
   */
  async getMonthlySummary(
    dateRange: ReportsRange = "last-6-months",
  ): Promise<MonthlyReportData[]> {
    const endpoint = `/api/reports/monthly-summary?range=${encodeURIComponent(
      dateRange,
    )}`;
    return apiRequest<MonthlyReportData[]>(endpoint, { method: "GET" });
  }

  /**
   * Fetch category breakdown
   */
  async getCategoryBreakdown(
    dateRange: ReportsRange = "last-30-days",
  ): Promise<CategoryBreakdown[]> {
    const endpoint = `/api/reports/category-breakdown?range=${encodeURIComponent(
      dateRange,
    )}`;
    return apiRequest<CategoryBreakdown[]>(endpoint, { method: "GET" });
  }

  /**
   * Fetch savings goals
   */
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const endpoint = `/api/reports/savings-goals`;
    return apiRequest<SavingsGoal[]>(endpoint, { method: "GET" });
  }

  /**
   * Fetch top expenses
   */
  async getTopExpenses(
    dateRange: ReportsRange = "last-30-days",
    limit: number = 5,
  ): Promise<TopExpense[]> {
    const endpoint = `/api/reports/top-expenses?range=${encodeURIComponent(
      dateRange,
    )}&limit=${limit}`;
    return apiRequest<TopExpense[]>(endpoint, { method: "GET" });
  }

  /**
   * Fetch financial insights
   */
  async getFinancialInsights(
    dateRange: ReportsRange = "last-30-days",
  ): Promise<string[]> {
    const endpoint = `/api/reports/insights?range=${encodeURIComponent(
      dateRange,
    )}`;
    return apiRequest<string[]>(endpoint, { method: "GET" });
  }

  /**
   * Export report as PDF
   * (uses raw fetch because we need a Blob, not JSON)
   */
  async exportReportPDF(
    dateRange: ReportsRange = "last-30-days",
  ): Promise<Blob> {
    const url = buildUrl(
      `/api/reports/export/pdf?range=${encodeURIComponent(dateRange)}`,
    );
    const token = getToken();

    console.log("📄 Export PDF request:", {
      url,
      hasToken: !!token,
    });

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log("📄 Export PDF response:", response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("❌ PDF export error body:", text);
      throw new Error(
        `Failed to export PDF: ${response.status} ${response.statusText}`,
      );
    }

    return response.blob();
  }

  /**
   * Get comparison data between two periods
   */
  async getComparisonData(period1: string, period2: string): Promise<any> {
    const endpoint = `/api/reports/comparison?period1=${encodeURIComponent(
      period1,
    )}&period2=${encodeURIComponent(period2)}`;
    return apiRequest<any>(endpoint, { method: "GET" });
  }

  /**
   * Get forecast data
   */
  async getForecastData(months: number = 6): Promise<any> {
    const endpoint = `/api/reports/forecast?months=${months}`;
    return apiRequest<any>(endpoint, { method: "GET" });
  }
}

// Export singleton instance
export const reportsService = new ReportsService();

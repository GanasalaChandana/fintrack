// services/reports.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8084';

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

class ReportsService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken') || localStorage.getItem('ft_token');
  }

  private getHeaders(): HeadersInit {
    const token = this.getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Fetch comprehensive financial reports
   */
  async getFinancialReports(dateRange: string = 'last-30-days'): Promise<ReportsData> {
    try {
      console.log('Fetching reports from:', `${API_BASE_URL}/api/reports/financial?range=${dateRange}`);
      
      const response = await fetch(
        `${API_BASE_URL}/api/reports/financial?range=${dateRange}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Reports data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      throw error;
    }
  }

  /**
   * Fetch monthly summary data
   */
  async getMonthlySummary(dateRange: string = 'last-6-months'): Promise<MonthlyReportData[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/monthly-summary?range=${dateRange}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch monthly summary: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching monthly summary:', error);
      throw error;
    }
  }

  /**
   * Fetch category breakdown
   */
  async getCategoryBreakdown(dateRange: string = 'last-30-days'): Promise<CategoryBreakdown[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/category-breakdown?range=${dateRange}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch category breakdown: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching category breakdown:', error);
      throw error;
    }
  }

  /**
   * Fetch savings goals
   */
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/reports/savings-goals`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch savings goals: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      throw error;
    }
  }

  /**
   * Fetch top expenses
   */
  async getTopExpenses(dateRange: string = 'last-30-days', limit: number = 5): Promise<TopExpense[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/top-expenses?range=${dateRange}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch top expenses: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching top expenses:', error);
      throw error;
    }
  }

  /**
   * Fetch financial insights
   */
  async getFinancialInsights(dateRange: string = 'last-30-days'): Promise<string[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/insights?range=${dateRange}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

  /**
   * Export report as PDF
   */
  async exportReportPDF(dateRange: string = 'last-30-days'): Promise<Blob> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/export/pdf?range=${dateRange}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to export PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error exporting PDF:', error);
      throw error;
    }
  }

  /**
   * Get comparison data between two periods
   */
  async getComparisonData(period1: string, period2: string): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/comparison?period1=${period1}&period2=${period2}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comparison data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      throw error;
    }
  }

  /**
   * Get forecast data
   */
  async getForecastData(months: number = 6): Promise<any> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reports/forecast?months=${months}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch forecast data: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching forecast data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const reportsService = new ReportsService();
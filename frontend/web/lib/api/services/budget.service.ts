// lib/api/services/budget.service.ts
import { apiRequest } from '@/lib/api';

export interface Budget {
  id?: string;
  category: string;
  budget: number;      // Changed from "amount"
  spent?: number;
  month: string;       // Changed from "period", format: "2025-12"
  icon?: string;
  color?: string;
}

export interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categoryBreakdown?: Array<{
    category: string;
    budget: number;
    spent: number;
    percentage: number;
  }>;
}

const handleError = (error: any, context: string) => {
  const errorInfo = {
    context,
    message: error?.message || 'Unknown error',
    status: error?.status,
    isNetworkError: (error as any)?.isNetworkError,
    data: (error as any)?.data,
  };

  console.error(`❌ API Error - ${context}:`, errorInfo);

  if (errorInfo.isNetworkError) {
    throw new Error('Cannot connect to server. Please ensure backend is running.');
  } else if (errorInfo.status === 404) {
    throw new Error('Endpoint not found (404). Backend may not have this API implemented.');
  } else if (errorInfo.status === 500) {
    throw new Error('Server error (500). Check backend logs for details.');
  } else if (errorInfo.status === 401) {
    throw new Error('Authentication required. Please log in again.');
  } else {
    throw error;
  }
};

export const budgetService = {
  /** Fetch all budgets for the authenticated user */
  async getAll(): Promise<Budget[]> {
    try {
      console.log('🔍 Fetching all budgets from: /budgets');
      const response = await apiRequest('/api/budgets', { method: 'GET' });

      if (Array.isArray(response)) {
        console.log(`✅ Fetched ${response.length} budgets`);
        return response as Budget[];
      } else if (response && Array.isArray(response.data)) {
        console.log(`✅ Fetched ${response.data.length} budgets`);
        return response.data as Budget[];
      } else if (response && Array.isArray(response.content)) {
        console.log(`✅ Fetched ${response.content.length} budgets (paginated)`);
        return response.content as Budget[];
      }

      console.log('✅ No budgets found, returning empty array');
      return [];
    } catch (error: any) {
      if (error.isNetworkError || error.status === 404 || error.status === 400) {
        console.warn('⚠️ Returning empty budgets array due to error:', {
          status: error.status,
          endpoint: '/api/budgets',
          isNetworkError: error.isNetworkError,
          message: error.message,
        });
        return [];
      }
      console.error('❌ Failed to fetch budgets:', error);
      return [];
    }
  },

  /** Fetch a single budget by ID */
  async getById(id: string): Promise<Budget> {
    try {
      console.log(`🔍 Fetching budget ${id}`);
      const response = await apiRequest(`/api/budgets/${encodeURIComponent(id)}`, { method: 'GET' });
      console.log(`✅ Fetched budget ${id}:`, response);
      return response as Budget;
    } catch (error: any) {
      handleError(error, `fetch budget ${id}`);
      throw error;
    }
  },

  /** Create a new budget */
  async create(budget: Budget): Promise<Budget> {
    try {
      console.log('✨ Creating new budget:', budget);
      const response = await apiRequest('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(budget),
      });
      console.log('✅ Budget created successfully:', response);
      return response as Budget;
    } catch (error: any) {
      handleError(error, 'create budget');
      throw error;
    }
  },

  /** Update an existing budget */
  async update(id: string, patch: Partial<Budget>): Promise<Budget> {
    try {
      console.log(`📝 Updating budget ${id}:`, patch);
      const response = await apiRequest(`/api/budgets/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      console.log('✅ Budget updated successfully:', response);
      return response as Budget;
    } catch (error: any) {
      handleError(error, `update budget ${id}`);
      throw error;
    }
  },

  /** Delete a budget */
  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting budget ${id}`);
      await apiRequest(`/api/budgets/${encodeURIComponent(id)}`, { method: 'DELETE' });
      console.log('✅ Budget deleted successfully');
    } catch (error: any) {
      handleError(error, `delete budget ${id}`);
      throw error;
    }
  },

  /** Compute budget stats locally (no backend endpoint required) */
  async getStats(): Promise<BudgetStats> {
    try {
      console.log('📊 Calculating budget stats from all budgets');
      const budgets = await this.getAll();

      const stats: BudgetStats = {
        totalBudget: budgets.reduce((sum, b) => sum + (b.budget || 0), 0),
        totalSpent: budgets.reduce((sum, b) => sum + (b.spent || 0), 0),
        remaining: 0,
        categoryBreakdown: budgets.map((b) => ({
          category: b.category,
          budget: b.budget || 0,
          spent: b.spent || 0,
          percentage: b.budget > 0 ? ((b.spent || 0) / b.budget) * 100 : 0,
        })),
      };

      stats.remaining = stats.totalBudget - stats.totalSpent;
      console.log('✅ Budget stats calculated:', stats);
      return stats;
    } catch (error: any) {
      console.error('❌ Failed to calculate budget stats:', error);
      return { totalBudget: 0, totalSpent: 0, remaining: 0, categoryBreakdown: [] };
    }
  },

  /** Check budget status (e.g., if user is over budget) */
  async checkStatus(budgetId: string): Promise<any> {
    try {
      console.log(`🔍 Checking status for budget ${budgetId}`);
      const response = await apiRequest(`/api/budgets/${encodeURIComponent(budgetId)}/status`, {
        method: 'GET',
      });
      return response;
    } catch (error: any) {
      console.error(`❌ Failed to check budget status for ${budgetId}:`, error);
      throw error;
    }
  },
};

export default budgetService;

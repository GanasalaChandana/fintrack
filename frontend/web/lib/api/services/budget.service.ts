// lib/api/services/budgetService.ts
import { apiClient } from '@/lib/api'; // Changed from 'api' to 'apiClient'

export interface Budget {
  id?: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  rollover: boolean;
  alertThreshold: number;
  spent?: number;
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
    message: error.message || 'Unknown error',
    status: error.status,
    isNetworkError: error.isNetworkError,
    data: error.data,
  };
  
  console.error(`❌ API Error - ${context}:`, errorInfo);
  
  // Return user-friendly error message
  if (errorInfo.isNetworkError) {
    throw new Error(`Cannot connect to server. Please ensure backend is running.`);
  } else if (errorInfo.status === 404) {
    throw new Error(`Endpoint not found (404). Backend may not have this API implemented.`);
  } else if (errorInfo.status === 500) {
    throw new Error(`Server error (500). Check backend logs for details.`);
  } else if (errorInfo.status === 401) {
    throw new Error(`Authentication required. Please log in again.`);
  } else {
    throw error;
  }
};

export const budgetService = {
  /**
   * Fetch all budgets for the authenticated user
   */
  async getAll(): Promise<Budget[]> {
    try {
      console.log('🔍 Fetching all budgets from: /budgets');
      const response = await apiClient.get('/budgets');
      
      // Handle different response structures
      if (Array.isArray(response)) {
        console.log(`✅ Fetched ${response.length} budgets`);
        return response;
      } else if (response && Array.isArray(response.data)) {
        console.log(`✅ Fetched ${response.data.length} budgets`);
        return response.data;
      } else if (response && Array.isArray(response.content)) {
        // Handle paginated response
        console.log(`✅ Fetched ${response.content.length} budgets (paginated)`);
        return response.content;
      }
      
      console.log('✅ No budgets found, returning empty array');
      return [];
    } catch (error: any) {
      // Return empty array for better UX on errors
      if (error.isNetworkError || error.status === 404 || error.status === 400) {
        console.warn('⚠️ Returning empty budgets array due to error:', {
          status: error.status,
          endpoint: '/budgets',
          isNetworkError: error.isNetworkError,
          message: error.message
        });
        return [];
      }
      
      console.error('❌ Failed to fetch budgets:', error);
      return [];
    }
  },

  /**
   * Fetch a single budget by ID
   */
  async getById(id: string): Promise<Budget> {
    try {
      console.log(`🔍 Fetching budget ${id}`);
      const response = await apiClient.get(`/budgets/${id}`);
      console.log(`✅ Fetched budget ${id}:`, response);
      return response as Budget;
    } catch (error: any) {
      handleError(error, `fetch budget ${id}`);
      throw error;
    }
  },

  /**
   * Create a new budget
   */
  async create(budget: Budget): Promise<Budget> {
    try {
      console.log('✨ Creating new budget:', budget);
      const response = await apiClient.post('/budgets', budget);
      console.log('✅ Budget created successfully:', response);
      return response as Budget;
    } catch (error: any) {
      handleError(error, 'create budget');
      throw error;
    }
  },

  /**
   * Update an existing budget
   */
  async update(id: string, patch: Partial<Budget>): Promise<Budget> {
    try {
      console.log(`📝 Updating budget ${id}:`, patch);
      const response = await apiClient.put(`/budgets/${id}`, patch);
      console.log('✅ Budget updated successfully:', response);
      return response as Budget;
    } catch (error: any) {
      handleError(error, `update budget ${id}`);
      throw error;
    }
  },

  /**
   * Delete a budget
   */
  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting budget ${id}`);
      await apiClient.delete(`/budgets/${id}`);
      console.log('✅ Budget deleted successfully');
    } catch (error: any) {
      handleError(error, `delete budget ${id}`);
      throw error;
    }
  },
  
  /**
   * Fetch budget statistics and summary
   * NOTE: Backend endpoint not implemented yet, returns calculated stats from budgets
   */
  async getStats(): Promise<BudgetStats> {
    try {
      console.log('📊 Calculating budget stats from all budgets');
      
      // Get all budgets and calculate stats locally
      const budgets = await this.getAll();
      
      const stats: BudgetStats = {
        totalBudget: budgets.reduce((sum, b) => sum + (b.amount || 0), 0),
        totalSpent: budgets.reduce((sum, b) => sum + (b.spent || 0), 0),
        remaining: 0,
        categoryBreakdown: budgets.map(b => ({
          category: b.category,
          budget: b.amount || 0,
          spent: b.spent || 0,
          percentage: b.amount > 0 ? ((b.spent || 0) / b.amount) * 100 : 0
        }))
      };
      
      stats.remaining = stats.totalBudget - stats.totalSpent;
      
      console.log('✅ Budget stats calculated:', stats);
      return stats;
    } catch (error: any) {
      console.error('❌ Failed to calculate budget stats:', error);
      
      // Return default stats
      return {
        totalBudget: 0,
        totalSpent: 0,
        remaining: 0,
        categoryBreakdown: [],
      };
    }
  },

  /**
   * Check budget status (e.g., if user is over budget)
   */
  async checkStatus(budgetId: string): Promise<any> {
    try {
      console.log(`🔍 Checking status for budget ${budgetId}`);
      const response = await apiClient.get(`/budgets/${budgetId}/status`);
      return response;
    } catch (error: any) {
      console.error(`❌ Failed to check budget status for ${budgetId}:`, error);
      throw error;
    }
  },
};
// types/index.ts

// Transaction Template Types
export interface TransactionTemplate {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  notes?: string;
  createdAt: string;
  usageCount: number;
}

// Quick Filter Types
export interface QuickFilter {
  id: string;
  label: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  active: boolean;
}

// Transaction Types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  notes?: string; // Added notes field
  tags?: string[]; // Added tags field
  createdAt: string;
  updatedAt: string;
}

// Budget Types
export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  spent?: number;
  createdAt: string;
  updatedAt: string;
}

// Alert Types
export interface BudgetAlert {
  id: string;
  budgetId: string;
  userId: string;
  type: 'WARNING_80' | 'WARNING_90' | 'EXCEEDED_100';
  percentage: number;
  currentSpent: number;
  budgetAmount: number;
  category: string;
  acknowledged: boolean;
  createdAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

// Date Range Type
export interface DateRange {
  start: Date;
  end: Date;
}
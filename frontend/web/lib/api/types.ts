// lib/api/types.ts - Type definitions for API responses

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  status?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number;
}

// types/google.d.ts

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleAccounts {
  id: {
    initialize(config: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
    }): void;
    renderButton(
      parent: HTMLElement | null,
      options: {
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
        shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        logo_alignment?: 'left' | 'center';
        width?: number | string;
        locale?: string;
      }
    ): void;
    prompt(): void;
    disableAutoSelect(): void;
  };
}

interface Window {
  google: {
    accounts: GoogleAccounts;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  recurring?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate?: string;
  spent?: number;
  remaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetStats {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentageUsed: number;
  budgetCount: number;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'BUDGET_EXCEEDED' | 'BUDGET_WARNING' | 'UNUSUAL_TRANSACTION' | 'INFO';
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  read: boolean;
  acknowledged: boolean;
  createdAt: string;
}

export interface Report {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  categoryBreakdown: CategoryBreakdown[];
  trends?: TrendData[];
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface TrendData {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}
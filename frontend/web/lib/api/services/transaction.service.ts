// lib/api/services/transaction.service.ts
import api from '@/lib/api';

export interface Transaction {
  id?: string;
  userId?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  recurring?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  period: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: 'INCOME' | 'EXPENSE';
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
}

function buildSearchParams(filters?: TransactionFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();

  // Append only known, allowed keys to avoid index-signature errors
  const {
    startDate, endDate, category, type,
    minAmount, maxAmount, page, size,
  } = filters;

  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (category) params.append('category', category);
  if (type) params.append('type', type);
  if (minAmount !== undefined) params.append('minAmount', String(minAmount));
  if (maxAmount !== undefined) params.append('maxAmount', String(maxAmount));
  if (page !== undefined) params.append('page', String(page));
  if (size !== undefined) params.append('size', String(size));

  return params.toString();
}

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const qs = buildSearchParams(filters);
      const endpoint = qs ? `/transactions?${qs}` : '/transactions';
      const res = (await api.get(endpoint)) as unknown;

      // Normalize a few possible shapes
      if (Array.isArray(res)) return res as Transaction[];
      if (res && Array.isArray((res as any).content)) return (res as any).content as Transaction[];
      if (res && Array.isArray((res as any).data)) return (res as any).data as Transaction[];

      return [];
    } catch (e) {
      console.error('❌ Failed to fetch transactions:', e);
      return [];
    }
  },

  async getById(id: string): Promise<Transaction> {
    const res = (await api.get(`/transactions/${id}`)) as unknown as Transaction;
    return res;
  },

  async create(tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const res = (await api.post('/transactions', tx)) as unknown as Transaction;
    return res;
  },

  async update(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const res = (await api.put(`/transactions/${id}`, updates)) as unknown as Transaction;
    return res;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async getSummary(filters?: Pick<TransactionFilters, 'startDate' | 'endDate'>): Promise<TransactionSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      const endpoint = params.toString() ? `/transactions/summary?${params}` : '/transactions/summary';

      const res = (await api.get(endpoint)) as unknown as TransactionSummary | undefined;
      return (
        res ?? {
          totalIncome: 0,
          totalExpenses: 0,
          netIncome: 0,
          transactionCount: 0,
          period: 'N/A',
        }
      );
    } catch (e) {
      console.error('❌ Failed to fetch transaction summary:', e);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        transactionCount: 0,
        period: 'N/A',
      };
    }
  },

  async classify(description: string): Promise<{ category: string; confidence: number }> {
    try {
      const res = (await api.post('/transactions/classify', { description })) as unknown as {
        category: string;
        confidence: number;
      };
      return res;
    } catch (e) {
      console.error('❌ Failed to classify transaction:', e);
      return { category: 'Uncategorized', confidence: 0 };
    }
  },

  async exportToCsv(filters?: TransactionFilters): Promise<Blob> {
    const qs = buildSearchParams(filters);
    const endpoint = qs ? `/transactions/export?${qs}` : '/transactions/export';

    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : '';

    const res = await fetch(`${base}${endpoint}`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) throw new Error('Failed to export transactions');
    return await res.blob();
  },
};

// hooks/useTransactions.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { transactionsAPI, type Transaction } from '@/lib/api';

interface UseTransactionsResult {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTransactions(filters?: Record<string, string | number>): UseTransactionsResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionsAPI.getAll(filters);
      setTransactions(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load transactions';
      setError(message);
      console.error('Error loading transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    try {
      const newTransaction = await transactionsAPI.create(transaction);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add transaction';
      throw new Error(message);
    }
  };

  const updateTransaction = async (
    id: string, 
    transaction: Partial<Transaction>
  ): Promise<Transaction> => {
    try {
      const updated = await transactionsAPI.update(id, transaction);
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updated } : t))
      );
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transaction';
      throw new Error(message);
    }
  };

  const deleteTransaction = async (id: string): Promise<void> => {
    try {
      await transactionsAPI.delete(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      throw new Error(message);
    }
  };

  const refresh = async (): Promise<void> => {
    await loadTransactions();
  };

  return {
    transactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refresh,
  };
}
"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { transactionsAPI, type Transaction as ApiTransaction } from "@/lib/api";
import { RecurringTransactionsDashboard } from "@/components/RecurringTransactionsDashboard";

// Transform API transaction to match detector interface
function transformTransaction(apiTxn: ApiTransaction) {
  return {
    id: apiTxn.id || `txn-${Date.now()}-${Math.random()}`,
    date: apiTxn.date,
    amount: Math.abs(apiTxn.amount), // Always positive
    category: apiTxn.category,
    description: apiTxn.description,
    type: apiTxn.type.toUpperCase() as 'INCOME' | 'EXPENSE', // Fix case
  };
}

export default function RecurringPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Fetching transactions for recurring detection...');
      const data = await transactionsAPI.getAll();

      console.log('📊 Raw transactions:', data.length);

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      // Transform transactions to match detector interface
      const transformed = data.map(transformTransaction);
      
      console.log('✅ Transformed transactions:', transformed.length);
      console.log('📝 Sample transaction:', transformed[0]);
      
      setTransactions(transformed);
    } catch (error: any) {
      console.error("❌ Failed to load transactions:", error);
      setError(error?.message || "Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRule = (rule: any) => {
    console.log('📋 Create rule:', rule);
    alert(`Would create recurring rule for: ${rule.pattern}\nAmount: $${rule.amount}\nFrequency: ${rule.frequency}`);
  };

  const handleDeleteRecurring = (id: string) => {
    console.log('🗑️ Delete recurring:', id);
    alert('Delete functionality not implemented yet');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-purple-600" />
          <p className="text-gray-600">Loading recurring transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4">
            <p className="text-red-600 font-semibold mb-2">
              ⚠️ Error Loading Transactions
            </p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={loadTransactions}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Recurring Transactions
                </h1>
                <p className="text-gray-600">
                  Automatically detect and manage your recurring payments
                </p>
              </div>
            </div>
            <button
              onClick={loadTransactions}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <RefreshCw className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Transactions Available
            </h3>
            <p className="text-gray-600">
              Add transactions to detect recurring patterns
            </p>
          </div>
        ) : (
          <RecurringTransactionsDashboard
            transactions={transactions}
            onCreateRule={handleCreateRule}
            onDeleteRecurring={handleDeleteRecurring}
          />
        )}
      </main>
    </div>
  );
}
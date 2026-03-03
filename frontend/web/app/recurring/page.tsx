"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { transactionsAPI, type Transaction as ApiTransaction } from "@/lib/api";
import { RecurringTransactionsDashboard } from "@/components/RecurringTransactionsDashboard";

function transformTransaction(apiTxn: ApiTransaction) {
  return {
    id: apiTxn.id || `txn-${Date.now()}-${Math.random()}`,
    date: apiTxn.date,
    amount: Math.abs(apiTxn.amount),
    category: apiTxn.category,
    description: apiTxn.description,
    type: apiTxn.type.toUpperCase() as "INCOME" | "EXPENSE",
  };
}

export default function RecurringPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void loadTransactions(); }, []);

  async function loadTransactions() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getAll();
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      setTransactions(data.map(transformTransaction));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateRule = (rule: any) => {
    alert(`Would create recurring rule for: ${rule.pattern}\nAmount: $${rule.amount}\nFrequency: ${rule.frequency}`);
  };

  const handleDeleteRecurring = (id: string) => {
    alert("Delete functionality not implemented yet");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Loading recurring transactions…</p>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Couldn't Load Transactions</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={loadTransactions}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Auto-detected</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recurring Transactions</h1>
            <p className="text-gray-400 text-sm mt-1">Automatically detect and manage your recurring payments.</p>
          </div>
          <button onClick={loadTransactions}
            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 hover:shadow-md transition-all self-start flex-shrink-0">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Empty state */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No Transactions Available</h3>
            <p className="text-sm text-gray-400">Add transactions to detect recurring patterns.</p>
          </div>
        ) : (
          <RecurringTransactionsDashboard
            transactions={transactions}
            onCreateRule={handleCreateRule}
            onDeleteRecurring={handleDeleteRecurring}
          />
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw, AlertCircle, Sparkles, X, CheckCircle } from "lucide-react";
import { transactionsAPI, type Transaction as ApiTransaction } from "@/lib/api";
import { RecurringTransactionsDashboard } from "@/components/RecurringTransactionsDashboard";

// ── Built-in toast ────────────────────────────────────────────────────────────

interface Toast { id: number; msg: string; type: "success" | "error" | "info" }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, show, dismiss };
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  const colors: Record<Toast["type"], string> = {
    success: "bg-emerald-600",
    error:   "bg-red-600",
    info:    "bg-indigo-600",
  };
  const icons: Record<Toast["type"], React.ReactNode> = {
    success: <CheckCircle className="w-4 h-4" />,
    error:   <AlertCircle className="w-4 h-4" />,
    info:    <Sparkles className="w-4 h-4" />,
  };
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white pointer-events-auto ${colors[t.type]}`}>
          {icons[t.type]}
          <span>{t.msg}</span>
          <button onClick={() => onDismiss(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Transform ─────────────────────────────────────────────────────────────────

function transformTransaction(apiTxn: ApiTransaction) {
  return {
    id:          apiTxn.id || `txn-${Date.now()}-${Math.random()}`,
    date:        apiTxn.date,
    amount:      Math.abs(apiTxn.amount),
    category:    apiTxn.category,
    description: apiTxn.description,
    type:        apiTxn.type.toUpperCase() as "INCOME" | "EXPENSE",
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function RecurringPage() {
  const [isLoading, setIsLoading]       = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [error, setError]               = useState<string | null>(null);
  const { toasts, show: showToast, dismiss } = useToast();

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getAll();
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      setTransactions(data.map(transformTransaction));
    } catch (err: any) {
      const msg = err?.message ?? "Failed to load transactions";
      setError(msg);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadTransactions(); }, [loadTransactions]);

  // ── Rule creation: store in localStorage, show toast ─────────────────────
  const handleCreateRule = useCallback((rule: any) => {
    try {
      const existing = JSON.parse(localStorage.getItem("recurring_rules") ?? "[]");
      // Avoid duplicates by pattern description
      const isDuplicate = existing.some((r: any) => r.pattern === rule.pattern);
      if (isDuplicate) {
        showToast(`Rule for "${rule.pattern}" already exists`, "info");
        return;
      }
      existing.push({ ...rule, createdAt: new Date().toISOString() });
      localStorage.setItem("recurring_rules", JSON.stringify(existing));
      showToast(`Rule created for "${rule.pattern}"`);
    } catch {
      showToast("Failed to save rule", "error");
    }
  }, [showToast]);

  // ── Delete: just dismisses from UI (no backend endpoint yet) ─────────────
  const handleDeleteRecurring = useCallback((id: string) => {
    showToast("Recurring pattern dismissed", "info");
  }, [showToast]);

  // ── Refresh with feedback ─────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    await loadTransactions();
    showToast("Transactions refreshed");
  }, [loadTransactions, showToast]);

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
    <>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

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
              <p className="text-gray-400 text-sm mt-1">
                Automatically detected recurring payments from {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}.
              </p>
            </div>
            <button onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 hover:shadow-md transition-all self-start flex-shrink-0">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>

          {/* Soft error banner */}
          {error && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-700">{error}</p>
            </div>
          )}

          {/* Empty: no transactions at all */}
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
    </>
  );
}
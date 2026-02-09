// frontend/web/app/(app)/transactions/page.tsx
"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  X as Close,
  Check,
  Wallet,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Copy,
  FileText,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

import {
  transactionsAPI,
  type Transaction as ApiTransaction,
} from "@/lib/api";
import { SearchAndFilters } from "@/components/SearchAndFilters";
import { EmptyState } from "@/components/EmptyState";

/* =========================
   Types
   ========================= */

type TxType = "income" | "expense";
type TxStatus = "completed" | "pending";

type CategoryId =
  | "all"
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "health"
  | "income"
  | "other";

interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
}

interface Transaction extends Omit<ApiTransaction, "category" | "type"> {
  category: Exclude<CategoryId, "all">;
  type: TxType;
  status: TxStatus;
  paymentMethod: string;
  tags: string[];
  aiSuggested: boolean;
  merchant?: string;
}

interface NewTxForm {
  date: string;
  merchant: string;
  description: string;
  amount: string;
  category: Exclude<CategoryId, "all">;
  type: TxType;
  status: TxStatus;
  paymentMethod: string;
}

interface TxFilters {
  search?: string;
  type?: "all" | TxType;
  category?: string;
  sort?: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

/* =========================
   Helpers
   ========================= */

const dtUS = (d: Date, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opts).format(d);

const formatAbsolute = (iso: string) =>
  dtUS(new Date(iso), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const useIsMounted = () => {
  const [m, setM] = React.useState(false);
  React.useEffect(() => setM(true), []);
  return m;
};

const formatRelativeClientOnly = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return formatAbsolute(iso);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(value));

const mapCategoryToUI = (category: string): Exclude<CategoryId, "all"> => {
  const map: Record<string, Exclude<CategoryId, "all">> = {
    "Food & Dining": "food",
    Transportation: "transport",
    Shopping: "shopping",
    Entertainment: "entertainment",
    "Bills & Utilities": "bills",
    Healthcare: "health",
    Income: "income",
    Salary: "income",
    Freelance: "income",
    Business: "income",
    Investment: "income",
  };
  return map[category] || "other";
};

const mapCategoryToBackend = (
  category: Exclude<CategoryId, "all">,
  type: TxType,
): string => {
  if (type === "income") return "Income";

  const map: Record<Exclude<CategoryId, "all">, string> = {
    food: "Food & Dining",
    transport: "Transportation",
    shopping: "Shopping",
    entertainment: "Entertainment",
    bills: "Bills & Utilities",
    health: "Healthcare",
    income: "Income",
    other: "Other",
  };
  return map[category] || "Other";
};

const toBackendType = (type: TxType) =>
  type === "income" ? "INCOME" : "EXPENSE";

const fromBackendType = (
  type: "INCOME" | "EXPENSE" | "income" | "expense",
): TxType =>
  type === "INCOME" || type === "income" ? "income" : "expense";

/* =========================
   Data
   ========================= */

const CATEGORIES: Category[] = [
  {
    id: "all",
    name: "All Categories",
    icon: "📊",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
  {
    id: "food",
    name: "Food & Dining",
    icon: "🍔",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  {
    id: "transport",
    name: "Transportation",
    icon: "🚗",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "🛍️",
    badgeBg: "bg-pink-100",
    badgeText: "text-pink-700",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "🎮",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
  },
  {
    id: "bills",
    name: "Bills & Utilities",
    icon: "💡",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  {
    id: "health",
    name: "Healthcare",
    icon: "⚕️",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  {
    id: "income",
    name: "Income",
    icon: "💰",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
];

const QUICK_DATE_FILTERS = [
  { label: "Today", days: 0 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "This Year", days: 365 },
];

/* =========================
   Toast Notification Component
   ========================= */

function ToastNotification({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: (id: string) => void;
}) {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`${bgColors[toast.type]} border-2 rounded-lg p-4 shadow-lg flex items-start gap-3 min-w-[320px] max-w-md animate-slide-in`}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium text-gray-900">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="text-gray-400 hover:text-gray-600"
      >
        <Close className="w-4 h-4" />
      </button>
    </div>
  );
}

/* =========================
   Component
   ========================= */

export default function TransactionManager() {
  const router = useRouter();
  const isMounted = useIsMounted();

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] =
    React.useState<Transaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = React.useState<
    string[]
  >([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<Transaction>>({});

  const [showAdd, setShowAdd] = React.useState<boolean>(false);
  const [showFilters, setShowFilters] = React.useState<boolean>(false);
  const [activeFilters, setActiveFilters] = React.useState<TxFilters>({
    sort: "date-desc",
  });

  const [form, setForm] = React.useState<NewTxForm>({
    date: new Date().toISOString().slice(0, 10),
    merchant: "",
    description: "",
    amount: "",
    category: "food",
    type: "expense",
    status: "completed",
    paymentMethod: "Credit Card •••• 4242",
  });
  const [formErrors, setFormErrors] = React.useState<
    Partial<Record<keyof NewTxForm, string>>
  >({});

  // Toast notifications
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auth Check + initial load
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      localStorage.getItem("authToken") || localStorage.getItem("ft_token");

    if (!token) {
      router.replace("/register?mode=signin");
      return;
    }

    void loadTransactions();
  }, [router]);

  const normalizeTransaction = (t: ApiTransaction): Transaction => ({
    id: t.id!,
    userId: t.userId,
    amount: t.amount,
    description: t.description,
    merchant: (t as any).merchant || t.description || "Unknown",
    category: mapCategoryToUI(t.category),
    date: t.date,
    type: fromBackendType(t.type),
    recurring: t.recurring,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    status: "completed",
    paymentMethod: "Credit Card •••• 4242",
    tags: [],
    aiSuggested: false,
  });

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await transactionsAPI.getAll();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format");
      }

      const transformed: Transaction[] = data.map(normalizeTransaction);

      setTransactions(transformed);
      setFilteredTransactions(transformed);
    } catch (err: any) {
      console.error("❌ Failed to load transactions:", err);

      if (
        err?.message?.includes("401") ||
        err?.message?.includes("Unauthorized")
      ) {
        setError("Authentication failed. Please sign in again.");
        setTimeout(() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("ft_token");
          router.replace("/register?mode=signin");
        }, 2000);
      } else {
        setError(err?.message || "Failed to load transactions");
      }

      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryInfo = React.useCallback(
    (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id)!,
    [],
  );

  const totals = React.useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  const onToggleSelect = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const onToggleSelectAll = (checked: boolean) => {
    setSelectedTransactions(
      checked ? filteredTransactions.map((t) => t.id!) : [],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;
    if (!confirm(`Delete ${selectedTransactions.length} transaction(s)?`))
      return;

    try {
      await Promise.all(
        selectedTransactions.map((id) => transactionsAPI.delete(id)),
      );
      setTransactions((prev) =>
        prev.filter((t) => !selectedTransactions.includes(t.id!)),
      );
      setFilteredTransactions((prev) =>
        prev.filter((t) => !selectedTransactions.includes(t.id!)),
      );
      setSelectedTransactions([]);
      showToast("success", `Deleted ${selectedTransactions.length} transactions`);
    } catch (err) {
      showToast("error", "Failed to delete transactions");
      console.error(err);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id!);
    setEditForm(transaction);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const uiType = (editForm.type ?? "expense") as TxType;
      const backendCategory = mapCategoryToBackend(
        editForm.category as Exclude<CategoryId, "all">,
        uiType,
      );
      const backendType = uiType;

      const updated = await transactionsAPI.update(editingId, {
        date: editForm.date!,
        description: editForm.description!,
        category: backendCategory,
        amount: editForm.amount!,
        type: backendType,
      });

      const normalized = normalizeTransaction(updated);

      const updateFn = (list: Transaction[]) =>
        list.map((t) =>
          t.id === editingId
            ? {
                ...normalized,
                status: editForm.status || t.status,
                paymentMethod: editForm.paymentMethod || t.paymentMethod,
                merchant: editForm.merchant || normalized.merchant,
              }
            : t,
        );

      setTransactions(updateFn);
      setFilteredTransactions(updateFn);

      setEditingId(null);
      setEditForm({});
      showToast("success", "Transaction updated successfully");
    } catch (err) {
      showToast("error", "Failed to update transaction");
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;

    try {
      await transactionsAPI.delete(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setFilteredTransactions((prev) => prev.filter((t) => t.id !== id));
      setSelectedTransactions((prev) => prev.filter((x) => x !== id));
      showToast("success", "Transaction deleted");
    } catch (err) {
      showToast("error", "Failed to delete transaction");
      console.error(err);
    }
  };

  const handleDuplicate = (transaction: Transaction) => {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      merchant: transaction.merchant || "",
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      type: transaction.type,
      status: "completed",
      paymentMethod: transaction.paymentMethod,
    });
    setShowAdd(true);
    showToast("info", "Transaction duplicated - ready to save");
  };

  const validate = (f: NewTxForm) => {
    const e: Partial<Record<keyof NewTxForm, string>> = {};
    if (!f.date) e.date = "Date is required";
    if (!f.merchant.trim()) e.merchant = "Merchant is required";
    if (!f.description.trim()) e.description = "Description is required";
    if (f.amount.trim() === "" || isNaN(Number(f.amount)))
      e.amount = "Enter a valid amount";
    if (!f.category) e.category = "Category is required";
    if (!f.type) e.type = "Type is required";
    return e;
  };

  const submitNewTx = async (e: React.FormEvent) => {
    e.preventDefault();

    const eMap = validate(form);
    setFormErrors(eMap);
    if (Object.keys(eMap).length) return;

    const parsed = Number(form.amount);
    const normalizedAmount = Math.abs(parsed);
    const backendCategory = mapCategoryToBackend(form.category, form.type);
    const backendType = toBackendType(form.type);

    try {
      const payload = {
        date: form.date,
        description: form.description.trim(),
        amount: normalizedAmount,
        category: backendCategory,
        type: backendType,
      };

      const created = await transactionsAPI.create(payload);

      const base = normalizeTransaction(created);
      const newTx: Transaction = {
        ...base,
        merchant: form.merchant.trim(),
        status: form.status,
        paymentMethod: form.paymentMethod.trim(),
      };

      setTransactions((prev) => [newTx, ...prev]);
      setFilteredTransactions((prev) => [newTx, ...prev]);
      setShowAdd(false);

      setForm({
        date: new Date().toISOString().slice(0, 10),
        merchant: "",
        description: "",
        amount: "",
        category: "food",
        type: "expense",
        status: "completed",
        paymentMethod: "Credit Card •••• 4242",
      });
      setFormErrors({});
      showToast("success", "Transaction added successfully");
    } catch (err: any) {
      console.error("❌ Failed to create transaction:", err);
      showToast("error", `Failed to create transaction: ${err?.message || "Unknown error"}`);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await transactionsAPI.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      showToast("success", "Transactions exported successfully");
    } catch (err) {
      showToast("error", "Failed to export transactions");
      console.error(err);
    }
  };

  const applyQuickDateFilter = (days: number) => {
    const today = new Date();
    const fromDate = new Date();
    fromDate.setDate(today.getDate() - days);

    setActiveFilters((prev) => ({
      ...prev,
      dateFrom: days === 0 ? today.toISOString().slice(0, 10) : fromDate.toISOString().slice(0, 10),
      dateTo: today.toISOString().slice(0, 10),
    }));
  };

  const clearFilters = () => {
    setActiveFilters({ sort: "date-desc" });
    setFilteredTransactions(transactions);
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.type && activeFilters.type !== "all") count++;
    if (activeFilters.category) count++;
    if (activeFilters.dateFrom) count++;
    if (activeFilters.dateTo) count++;
    if (activeFilters.minAmount) count++;
    if (activeFilters.maxAmount) count++;
    return count;
  }, [activeFilters]);

  React.useEffect(() => {
    let filtered = [...transactions];

    if (activeFilters.search) {
      const q = activeFilters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          (t.merchant || "").toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }

    if (activeFilters.type && activeFilters.type !== "all") {
      filtered = filtered.filter((t) => t.type === activeFilters.type);
    }

    if (activeFilters.category) {
      const catId = mapCategoryToUI(activeFilters.category);
      filtered = filtered.filter((t) => t.category === catId);
    }

    if (activeFilters.dateFrom) {
      filtered = filtered.filter((t) => t.date >= activeFilters.dateFrom!);
    }

    if (activeFilters.dateTo) {
      filtered = filtered.filter((t) => t.date <= activeFilters.dateTo!);
    }

    if (activeFilters.minAmount !== undefined) {
      filtered = filtered.filter(
        (t) => Math.abs(t.amount) >= activeFilters.minAmount!,
      );
    }

    if (activeFilters.maxAmount !== undefined) {
      filtered = filtered.filter(
        (t) => Math.abs(t.amount) <= activeFilters.maxAmount!,
      );
    }

    const sort = activeFilters.sort || "date-desc";
    filtered = filtered.sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return +new Date(b.date) - +new Date(a.date);
        case "date-asc":
          return +new Date(a.date) - +new Date(b.date);
        case "amount-desc":
          return Math.abs(b.amount) - Math.abs(a.amount);
        case "amount-asc":
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
    setSelectedTransactions([]);
  }, [transactions, activeFilters]);

  /* =========================
     Render states
     ========================= */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4">
            <p className="text-red-600 font-semibold mb-2">
              ⚠️ Error Loading Transactions
            </p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={loadTransactions}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     Main UI
     ========================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            toast={toast}
            onClose={removeToast}
          />
        ))}
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
              <p className="text-sm text-gray-600">
                {filteredTransactions.length} of {transactions.length} transactions
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active)
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters || activeFilterCount > 0
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Total Income
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totals.income)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From filtered results
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Total Expenses
              </span>
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totals.expenses)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From filtered results
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Net Amount
              </span>
              <div
                className={`w-8 h-8 bg-gradient-to-br ${
                  totals.net >= 0
                    ? "from-blue-500 to-blue-600"
                    : "from-gray-500 to-gray-600"
                } rounded-lg flex items-center justify-center`}
              >
                <DollarSign className="w-4 h-4 text-white" />
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                totals.net >= 0 ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {formatCurrency(totals.net)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              From filtered results
            </p>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Advanced Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Quick Date Filters */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Date Range
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_DATE_FILTERS.map((filter) => (
                  <button
                    key={filter.label}
                    onClick={() => applyQuickDateFilter(filter.days)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Merchant or description..."
                  value={activeFilters.search || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={activeFilters.type || "all"}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      type: e.target.value as "all" | TxType,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={activeFilters.category || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={activeFilters.sort}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      sort: e.target.value as TxFilters["sort"],
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="amount-desc">Amount (High to Low)</option>
                  <option value="amount-asc">Amount (Low to High)</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={activeFilters.dateFrom || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      dateFrom: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={activeFilters.dateTo || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      dateTo: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={activeFilters.minAmount || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      minAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={activeFilters.maxAmount || ""}
                  onChange={(e) =>
                    setActiveFilters((prev) => ({
                      ...prev,
                      maxAmount: e.target.value ? parseFloat(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedTransactions.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {selectedTransactions.length} transaction
                {selectedTransactions.length > 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTransactions([])}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        filteredTransactions.length > 0 &&
                        selectedTransactions.length ===
                          filteredTransactions.length
                      }
                      onChange={(e) => onToggleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Merchant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((t) => {
                  const cat = getCategoryInfo(t.category);
                  const isEditing = editingId === t.id;

                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors ${
                        selectedTransactions.includes(t.id!)
                          ? "bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(t.id!)}
                          onChange={() => onToggleSelect(t.id!)}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                date: e.target.value,
                              }))
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900">
                              {isMounted
                                ? formatRelativeClientOnly(t.date)
                                : formatAbsolute(t.date)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dtUS(new Date(t.date))}
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.merchant || ""}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  merchant: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Merchant"
                            />
                            <input
                              type="text"
                              value={editForm.description}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                              placeholder="Description"
                            />
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${
                                t.type === "income"
                                  ? "from-green-500 to-green-600"
                                  : "from-blue-500 to-blue-600"
                              } rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                            >
                              {(t.merchant || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {t.merchant || "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {t.description}
                              </div>
                              {t.aiSuggested && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Sparkles className="w-3 h-3 text-purple-600" />
                                  <span className="text-xs text-purple-600 font-medium">
                                    AI Suggested
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select
                            value={editForm.category}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                category: e.target.value as Exclude<
                                  CategoryId,
                                  "all"
                                >,
                              }))
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          >
                            {CATEGORIES.filter((c) => c.id !== "all").map(
                              (cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </option>
                              ),
                            )}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cat.badgeBg} ${cat.badgeText}`}
                          >
                            <span>{cat.icon}</span>
                            {cat.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {t.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={Math.abs(editForm.amount || 0)}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                amount: parseFloat(e.target.value),
                              }))
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          />
                        ) : (
                          <div
                            className={`text-base font-bold ${
                              t.type === "income"
                                ? "text-green-600"
                                : "text-gray-900"
                            }`}
                          >
                            {t.type === "income" ? "+" : "-"}
                            {formatCurrency(t.amount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            t.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {t.status === "completed" ? "Completed" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={handleSaveEdit}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              <Close className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(t)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(t)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id!)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600 mb-4">
                {activeFilterCount > 0
                  ? "Try adjusting your filters or search query"
                  : "Get started by adding your first transaction"}
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-900">
                Add Transaction
              </h3>
              <button
                onClick={() => setShowAdd(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <Close className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={submitNewTx} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({ ...form, date: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {formErrors.date && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.date}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as TxType })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  {formErrors.type && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.type}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Starbucks"
                    value={form.merchant}
                    onChange={(e) =>
                      setForm({ ...form, merchant: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {formErrors.merchant && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.merchant}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g., 12.99"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {formErrors.amount && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Morning coffee"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {formErrors.description && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as Exclude<
                          CategoryId,
                          "all"
                        >,
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as TxStatus,
                      })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Credit Card •••• 4242"
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
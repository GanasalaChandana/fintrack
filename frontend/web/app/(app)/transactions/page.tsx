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
} from "lucide-react";

import { transactionsAPI, type Transaction as ApiTransaction } from "@/lib/api";
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

/**
 * UI Transaction type
 * - We override ApiTransaction.category and ApiTransaction.type
 * - In the UI we always use lowercase "income" / "expense"
 */
interface Transaction
  extends Omit<ApiTransaction, "category" | "type"> {
  category: Exclude<CategoryId, "all">;
  type: TxType;
  status: TxStatus;
  paymentMethod: string;
  tags: string[];
  aiSuggested: boolean;
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
  category?: string; // label from SearchAndFilters (e.g. "Food & Dining")
  sort?: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
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

/**
 * Map UI category + type -> backend category label
 */
const mapCategoryToBackend = (
  category: Exclude<CategoryId, "all">,
  type: TxType
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

/**
 * Map UI type -> backend enum value
 */
const toBackendType = (type: TxType | undefined) =>
  type === "income" ? "INCOME" : "EXPENSE";

/**
 * Map backend enum -> UI type
 */
const fromBackendType = (type: ApiTransaction["type"]): TxType =>
  type === "INCOME" ? "income" : "expense";

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

/* =========================
   Component
   ========================= */

export default function TransactionManager() {
  const router = useRouter();
  const isMounted = useIsMounted();

  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = React.useState<
    Transaction[]
  >([]);
  const [selectedTransactions, setSelectedTransactions] = React.useState<
    string[]
  >([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<Transaction>>({});

  // ---------- Auth Check ----------
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("ft_token");

      if (!token) {
        router.replace("/register?mode=signin");
      } else {
        setIsAuthenticated(true);
        void loadTransactions();
      }
    }
  }, [router]);

  // ---------- Load Transactions from API ----------
  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await transactionsAPI.getAll();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: expected array of transactions");
      }

      const transformed: Transaction[] = data.map((t) => ({
        ...t,
        id: t.id!,
        type: fromBackendType(t.type),      // 👈 normalize enum to "income"/"expense"
        category: mapCategoryToUI(t.category),
        status: "completed" as TxStatus,
        paymentMethod: "Credit Card •••• 4242",
        tags: [],
        aiSuggested: false,
      }));

      setTransactions(transformed);
      setFilteredTransactions(transformed);
    } catch (err: any) {
      console.error("❌ Failed to load transactions:", err);

      if (err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        setError("Authentication failed. Please sign in again.");
        setTimeout(() => {
          localStorage.removeItem("authToken");
          localStorage.removeItem("ft_token");
          router.replace("/register?mode=signin");
        }, 2000);
      } else {
        setError(err.message || "Failed to load transactions");
      }

      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Add-Transaction Modal ----------
  const [showAdd, setShowAdd] = React.useState<boolean>(false);
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

  const getCategoryInfo = React.useCallback(
    (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id)!,
    []
  );

  const totals = React.useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  const onToggleSelect = (id: string) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleSelectAll = (checked: boolean) => {
    setSelectedTransactions(
      checked ? filteredTransactions.map((t) => t.id!) : []
    );
  };

  const handleBulkDelete = async () => {
    if (selectedTransactions.length === 0) return;
    if (!confirm(`Delete ${selectedTransactions.length} transaction(s)?`))
      return;

    try {
      await Promise.all(
        selectedTransactions.map((id) => transactionsAPI.delete(id))
      );
      setTransactions((prev) =>
        prev.filter((t) => !selectedTransactions.includes(t.id!))
      );
      setFilteredTransactions((prev) =>
        prev.filter((t) => !selectedTransactions.includes(t.id!))
      );
      setSelectedTransactions([]);
    } catch (err) {
      alert("Failed to delete transactions");
      console.error(err);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id!);
    setEditForm(transaction);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;

    try {
      const backendCategory = mapCategoryToBackend(
        editForm.category as Exclude<CategoryId, "all">,
        editForm.type as TxType
      );

      const updated = await transactionsAPI.update(editingId, {
        date: editForm.date,
        description: editForm.description,
        merchant: editForm.merchant,
        category: backendCategory,
        amount: editForm.amount,
        type: toBackendType(editForm.type as TxType), // 👈 send enum to backend
      });

      const updateFn = (list: Transaction[]) =>
        list.map((t) =>
          t.id === editingId
            ? {
                ...t,
                ...updated,
                type: fromBackendType(updated.type), // 👈 normalize back to UI
                category: mapCategoryToUI(updated.category),
                status: editForm.status as TxStatus,
                paymentMethod: editForm.paymentMethod || t.paymentMethod,
              }
            : t
        );

      setTransactions(updateFn);
      setFilteredTransactions(updateFn);

      setEditingId(null);
      setEditForm({});
    } catch (err) {
      alert("Failed to update transaction");
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
    } catch (err) {
      alert("Failed to delete transaction");
      console.error(err);
    }
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
    const backendType = toBackendType(form.type); // 👈 enum

    try {
      const created = await transactionsAPI.create({
        date: form.date,
        merchant: form.merchant.trim(),
        description: form.description.trim(),
        amount: normalizedAmount,
        category: backendCategory,
        type: backendType, // 👈 send INCOME / EXPENSE
      });

      const newTx: Transaction = {
        ...created,
        id: created.id!,
        type: fromBackendType(created.type), // 👈 normalize to UI
        category: mapCategoryToUI(created.category),
        status: form.status,
        paymentMethod: form.paymentMethod.trim(),
        tags: [],
        aiSuggested: false,
      };

      setTransactions((prev) => [newTx, ...prev]);
      setFilteredTransactions((prev) => [newTx, ...prev]);
      setShowAdd(false);
      setForm((f) => ({
        ...f,
        merchant: "",
        description: "",
        amount: "",
      }));
      setFormErrors({});
    } catch (err) {
      alert("Failed to create transaction");
      console.error(err);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await transactionsAPI.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
    } catch (err) {
      alert("Failed to export transactions");
      console.error(err);
    }
  };

  // ---------- Filters via SearchAndFilters ----------
  const categoriesForFilters = React.useMemo(
    () => CATEGORIES.filter((c) => c.id !== "all").map((c) => c.name),
    []
  );

  const handleFilterChange = React.useCallback(
    (filters: TxFilters) => {
      let filtered = [...transactions];

      if (filters.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.merchant.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
        );
      }

      if (filters.type && filters.type !== "all") {
        filtered = filtered.filter((t) => t.type === filters.type);
      }

      if (filters.category) {
        const catId = mapCategoryToUI(filters.category);
        filtered = filtered.filter((t) => t.category === catId);
      }

      const sort = filters.sort || "date-desc";
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
      setSelectedTransactions([]); // reset selection on new filters
    },
    [transactions]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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

  // 🔹 Global empty state when there are no transactions at all
  if (transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <EmptyState
            icon={Wallet}
            title="No Transactions Yet"
            description="Start tracking your finances by adding your first transaction. It only takes a few seconds!"
            actionLabel="Add Transaction"
            onAction={() => setShowAdd(true)}
            gradient="from-blue-500 to-purple-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
              <p className="text-sm text-gray-600">
                {filteredTransactions.length} transactions
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
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
        {/* Summary Cards */}
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
          </div>
        </div>

        {/* Filters (via SearchAndFilters) */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <SearchAndFilters
            onFilterChange={handleFilterChange}
            categories={categoriesForFilters}
          />

          {/* Bulk actions */}
          {selectedTransactions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedTransactions.length} selected
              </span>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>

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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onToggleSelectAll(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 rounded"
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
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(t.id!)}
                          onChange={() => onToggleSelect(t.id!)}
                          className="w-4 h-4 text-blue-600 rounded"
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
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
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
                              value={editForm.merchant}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  merchant: e.target.value,
                                }))
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                              {t.merchant.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {t.merchant}
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
                                category:
                                  e.target
                                    .value as Exclude<CategoryId, "all">,
                              }))
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {CATEGORIES.filter((c) => c.id !== "all").map(
                              (cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.icon} {cat.name}
                                </option>
                              )
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
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right"
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
                          {t.status === "completed"
                            ? "Completed"
                            : "Pending"}
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
                              onClick={() => {
                                setEditingId(null);
                                setEditForm({});
                              }}
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
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id!)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
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
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
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
                        category: e.target
                          .value as Exclude<CategoryId, "all">,
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
    </div>
  );
}

"use client";
import { useRouter } from 'next/navigation';
import * as React from "react";
import {
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Tag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Sparkles,
  X as Close,
} from "lucide-react";

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
  icon: string; // emoji
  badgeBg: string;
  badgeText: string;
}

interface Transaction {
  id: number;
  date: string; // ISO yyyy-mm-dd
  merchant: string;
  description: string;
  amount: number; // income positive, expense negative
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
  amount: string; // keep as string in form, parse on submit
  category: Exclude<CategoryId, "all">;
  type: TxType;
  status: TxStatus;
  paymentMethod: string;
}

/* =========================
   Helpers
   ========================= */

const dtUS = (d: Date, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", opts).format(d);

const formatAbsolute = (iso: string) =>
  dtUS(new Date(iso), { month: "short", day: "numeric", year: "numeric" });

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

/* =========================
   Data
   ========================= */

const CATEGORIES: Category[] = [
  { id: "all", name: "All Categories", icon: "📊", badgeBg: "bg-gray-100", badgeText: "text-gray-700" },
  { id: "food", name: "Food & Dining", icon: "🍔", badgeBg: "bg-blue-100", badgeText: "text-blue-700" },
  { id: "transport", name: "Transportation", icon: "🚗", badgeBg: "bg-purple-100", badgeText: "text-purple-700" },
  { id: "shopping", name: "Shopping", icon: "🛍️", badgeBg: "bg-pink-100", badgeText: "text-pink-700" },
  { id: "entertainment", name: "Entertainment", icon: "🎮", badgeBg: "bg-orange-100", badgeText: "text-orange-700" },
  { id: "bills", name: "Bills & Utilities", icon: "💡", badgeBg: "bg-green-100", badgeText: "text-green-700" },
  { id: "health", name: "Healthcare", icon: "⚕️", badgeBg: "bg-red-100", badgeText: "text-red-700" },
  { id: "income", name: "Income", icon: "💰", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700" },
  { id: "other", name: "Other", icon: "📦", badgeBg: "bg-gray-100", badgeText: "text-gray-700" },
];

const INITIAL_TX: Transaction[] = [
  {
    id: 1,
    date: "2025-11-18",
    merchant: "Starbucks Coffee",
    description: "Morning coffee",
    amount: -5.8,
    category: "food",
    type: "expense",
    status: "completed",
    paymentMethod: "Credit Card •••• 4242",
    tags: ["coffee", "breakfast"],
    aiSuggested: false,
  },
  {
    id: 2,
    date: "2025-11-17",
    merchant: "Amazon",
    description: "Electronics purchase",
    amount: -89.99,
    category: "shopping",
    type: "expense",
    status: "completed",
    paymentMethod: "Credit Card •••• 4242",
    tags: ["online", "electronics"],
    aiSuggested: true,
  },
  {
    id: 3,
    date: "2025-11-17",
    merchant: "Uber",
    description: "Ride to downtown",
    amount: -15.5,
    category: "transport",
    type: "expense",
    status: "completed",
    paymentMethod: "Debit Card •••• 1234",
    tags: ["commute"],
    aiSuggested: false,
  },
  {
    id: 4,
    date: "2025-11-15",
    merchant: "Acme Corp",
    description: "Monthly salary",
    amount: 3500,
    category: "income",
    type: "income",
    status: "completed",
    paymentMethod: "Direct Deposit",
    tags: ["salary", "recurring"],
    aiSuggested: false,
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

  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedCategory, setSelectedCategory] = React.useState<CategoryId>("all");
  const [selectedType, setSelectedType] = React.useState<"all" | TxType>("all");
  const [sortBy, setSortBy] = React.useState<
    "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
  >("date-desc");
  const [transactions, setTransactions] = React.useState<Transaction[]>(INITIAL_TX);
  const [selectedTransactions, setSelectedTransactions] = React.useState<number[]>([]);

  // ---------- Auth Check ----------
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('ft_token');
      
      if (!token) {
        router.replace('/register?mode=signin');
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }
  }, [router]);

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
  const [errors, setErrors] = React.useState<Partial<Record<keyof NewTxForm, string>>>({});
  const nextId = React.useRef<number>(Math.max(...transactions.map(t => t.id)) + 1 || 1);

  const getCategoryInfo = React.useCallback(
    (id: CategoryId): Category => CATEGORIES.find((c) => c.id === id)!,
    []
  );

  const filteredTransactions = React.useMemo(() => {
    const list = transactions
      .filter((t) => (selectedCategory !== "all" ? t.category === selectedCategory : true))
      .filter((t) => (selectedType !== "all" ? t.type === selectedType : true))
      .filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.merchant.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
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
    return list;
  }, [transactions, selectedCategory, selectedType, searchQuery, sortBy]);

  const totals = React.useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  const onToggleSelect = (id: number) => {
    setSelectedTransactions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onToggleSelectAll = (checked: boolean) => {
    setSelectedTransactions(checked ? filteredTransactions.map((t) => t.id) : []);
  };

  const handleBulkCategorize = () => {
    setTransactions((prev) =>
      prev.map((t) =>
        selectedTransactions.includes(t.id) ? { ...t, aiSuggested: true } : t
      )
    );
    setSelectedTransactions([]);
  };

  // ---------- Create Transaction ----------
  const validate = (f: NewTxForm) => {
    const e: Partial<Record<keyof NewTxForm, string>> = {};
    if (!f.date) e.date = "Date is required";
    if (!f.merchant.trim()) e.merchant = "Merchant is required";
    if (!f.description.trim()) e.description = "Description is required";
    if (f.amount.trim() === "" || isNaN(Number(f.amount))) e.amount = "Enter a valid amount";
    if (!f.category) e.category = "Category is required";
    if (!f.type) e.type = "Type is required";
    if (!f.status) e.status = "Status is required";
    if (!f.paymentMethod.trim()) e.paymentMethod = "Payment method is required";
    return e;
  };

  const submitNewTx = (e: React.FormEvent) => {
    e.preventDefault();
    const eMap = validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length) return;

    const parsed = Number(form.amount);
    const normalizedAmount =
      form.type === "income" ? Math.abs(parsed) : -Math.abs(parsed);

    const tx: Transaction = {
      id: nextId.current++,
      date: form.date,
      merchant: form.merchant.trim(),
      description: form.description.trim(),
      amount: normalizedAmount,
      category: form.category,
      type: form.type,
      status: form.status,
      paymentMethod: form.paymentMethod.trim(),
      tags: [],
      aiSuggested: false,
    };

    setTransactions((prev) => [tx, ...prev]);
    setShowAdd(false);
    setForm((f) => ({ ...f, merchant: "", description: "", amount: "" }));
    setErrors({});
  };

  // Show loading while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
              <span className="text-sm font-medium text-gray-600">Total Income</span>
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
              <span className="text-sm font-medium text-gray-600">Total Expenses</span>
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
              <span className="text-sm font-medium text-gray-600">Net Amount</span>
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category */}
            <select
              value={selectedCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedCategory(e.target.value as CategoryId)
              }
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>

            {/* Type */}
            <select
              value={selectedType}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedType(e.target.value as "all" | TxType)
              }
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-medium"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSortBy(
                  e.target.value as
                    | "date-desc"
                    | "date-asc"
                    | "amount-desc"
                    | "amount-asc"
                )
              }
              className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-medium"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          {/* Bulk actions */}
          {selectedTransactions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {selectedTransactions.length} selected
              </span>
              <button
                onClick={handleBulkCategorize}
                className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Categorize
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors">
                <Tag className="w-4 h-4" />
                Add Tag
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors">
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
                        selectedTransactions.length === filteredTransactions.length
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
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTransactions.includes(t.id)}
                          onChange={() => onToggleSelect(t.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {isMounted
                            ? formatRelativeClientOnly(t.date)
                            : formatAbsolute(t.date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {dtUS(new Date(t.date))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cat.badgeBg} ${cat.badgeText}`}
                        >
                          <span>{cat.icon}</span>
                          {cat.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {t.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div
                          className={`text-base font-bold ${
                            t.type === "income" ? "text-green-600" : "text-gray-900"
                          }`}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {formatCurrency(t.amount)}
                        </div>
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
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
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
              <h3 className="text-lg font-bold text-gray-900">Add Transaction</h3>
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
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
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
                  {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Starbucks"
                    value={form.merchant}
                    onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {errors.merchant && (
                    <p className="text-xs text-red-600 mt-1">{errors.merchant}</p>
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
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-600 mt-1">{errors.amount}</p>
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
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600 mt-1">{errors.description}</p>
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
                        category: e.target.value as Exclude<CategoryId, "all">,
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
                  {errors.category && (
                    <p className="text-xs text-red-600 mt-1">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as TxStatus })
                    }
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                  </select>
                  {errors.status && (
                    <p className="text-xs text-red-600 mt-1">{errors.status}</p>
                  )}
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
                  {errors.paymentMethod && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.paymentMethod}
                    </p>
                  )}
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
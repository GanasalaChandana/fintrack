"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  PiggyBank,
  AlertCircle,
  Loader2,
  Upload,
  BarChart3,
  Camera,
  Brain,
  RefreshCw,
  Activity,
  CreditCard,
  Lock,
  Zap,
  Plus,
} from "lucide-react";

import { SpendingTrendChart } from "@/components/dashboard/SpendingTrendChart";
import { BudgetComparisonChart } from "@/components/dashboard/BudgetComparisonChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { GoalProgressChart } from "@/components/dashboard/GoalProgressChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { CSVImportModal, type CSVRow } from "@/components/CSVImportModal";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import {
  getToken,
  isAuthenticated as checkAuth,
  transactionsAPI,
  budgetsAPI,
} from "@/lib/api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(value);

// Safe percentage change — returns null when previous value is 0
const safePercentChange = (current: number, previous: number): number | null => {
  if (previous === 0 || isNaN(previous) || isNaN(current)) return null;
  return ((current - previous) / previous) * 100;
};

// Empty state card for new users
const EmptyStatCard = ({
  title,
  description,
  action,
  actionLabel,
}: {
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
}) => (
  <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 text-center">
    <p className="mb-1 font-semibold text-gray-400">{title}</p>
    <p className="mb-3 text-sm text-gray-400">{description}</p>
    <button
      onClick={action}
      className="mx-auto flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
    >
      <Plus className="h-3 w-3" /> {actionLabel}
    </button>
  </div>
);

interface Stats {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  netWorth: number;
  incomeChange: number | null;
  expensesChange: number | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [spendingTrendData, setSpendingTrendData] = useState<any[]>([]);
  const [budgetComparisonData, setBudgetComparisonData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    netWorth: 0,
    incomeChange: null,
    expensesChange: null,
  });
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Auth check
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authenticated = checkAuth();
      if (!authenticated) {
        router.replace("/register?mode=signin&reason=session_required");
        return;
      }
      try {
        const token = getToken();
        if (token) {
          const payload = JSON.parse(atob(token.split(".")[1]));
          setUserName(payload.name || payload.email?.split("@")[0] || "");
        }
      } catch {
        // Silently fail — user name is cosmetic
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    }
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            setEditingTransaction(null);
            setShowTransactionModal(true);
            break;
          case "k":
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
            break;
          case "d":
            e.preventDefault();
            router.push("/dashboard");
            break;
          case "b":
            e.preventDefault();
            router.push("/goals-budgets?tab=budgets");
            break;
          case "t":
            e.preventDefault();
            router.push("/transactions");
            break;
          case "r":
            e.preventDefault();
            router.push("/reports");
            break;
          case "g":
            e.preventDefault();
            router.push("/goals-budgets?tab=goals");
            break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [router]);

  const processSpendingTrend = (transactions: any[]) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthTransactions = transactions.filter((t) => t.date?.startsWith(monthKey));
      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);
      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + (t.amount ?? 0), 0);
      data.push({ month: months[date.getMonth()], income, expenses, savings: income - expenses });
    }
    return data;
  };

  const processBudgetComparison = (budgets: any[]) =>
    budgets
      // ✅ Filter out corrupt/junk budget entries
      .filter((b) =>
        b.category &&
        typeof b.category === "string" &&
        b.category.trim().length > 2 &&
        (b.budget ?? 0) >= 1
      )
      .map((b) => ({
        category: b.category,
        budget: b.budget ?? 0,
        spent: b.spent ?? 0,
        remaining: Math.max((b.budget ?? 0) - (b.spent ?? 0), 0),
      }));

  const processCategoryBreakdown = (transactions: any[]) => {
    const categoryMap = new Map<string, number>();
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + (t.amount ?? 0));
      });
    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const calculateStats = (trendData: any[], goalsList: any[]): Stats => {
    // ✅ Use most recent month with actual data instead of blindly taking last entry
    const relevantMonths = trendData.filter((m) => m.income > 0 || m.expenses > 0);
    const thisMonth = relevantMonths[relevantMonths.length - 1] ?? { income: 0, expenses: 0 };
    const lastMonth = relevantMonths[relevantMonths.length - 2] ?? { income: 0, expenses: 0 };

    const totalIncome = thisMonth.income;
    const totalExpenses = thisMonth.expenses;
    const totalSavings = totalIncome - totalExpenses;

    // ✅ incomeChange / expensesChange stay null when no previous data — no ?? 0 fallback
    const incomeChange = safePercentChange(thisMonth.income, lastMonth.income);
    const expensesChange = safePercentChange(thisMonth.expenses, lastMonth.expenses);

    const goalsSavings = goalsList.reduce((sum, g) => sum + (g.current ?? 0), 0);
    const netWorth = goalsSavings + totalSavings;

    return { totalIncome, totalExpenses, totalSavings, netWorth, incomeChange, expensesChange };
  };

  const fetchDashboardData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [transactions, budgets] = await Promise.all([
        transactionsAPI.getAll().catch(() => [] as any[]),
        budgetsAPI.getAll().catch(() => [] as any[]),
      ]);

      setHasTransactions(Array.isArray(transactions) && transactions.length > 0);

      const trendData = processSpendingTrend(transactions);
      setSpendingTrendData(trendData);

      const budgetData = processBudgetComparison(budgets);
      setBudgetComparisonData(budgetData);

      const catData = processCategoryBreakdown(transactions);
      setCategoryData(catData);

      // Goals: extend here when goals API is available
      const goalsData: any[] = [];
      setGoals(goalsData);

      const calculatedStats = calculateStats(trendData, goalsData);
      setStats(calculatedStats);

      setLastUpdated(new Date());
    } catch (error) {
      console.error("❌ Failed to fetch dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchDashboardData();
  }, [isAuthenticated, fetchDashboardData]);

  const handleImportTransactions = async (rows: CSVRow[]): Promise<void> => {
    const normalizeString = (value: unknown) => (value ?? "").toString().trim();
    const requests = rows.map((row) => {
      const date = normalizeString(row["Date"] ?? row["date"]);
      const merchant = normalizeString(row["Merchant"] ?? row["merchant"]);
      const description = normalizeString(row["Description"] ?? row["description"] ?? merchant);
      const category = normalizeString(row["Category"] ?? row["category"] ?? "Other");
      const rawAmount = Number(row["Amount"] ?? row["amount"] ?? 0);
      const typeRaw = normalizeString(row["Type"] ?? row["type"]);
      const type: "income" | "expense" =
        typeRaw.toLowerCase() === "income" || typeRaw.toLowerCase() === "credit"
          ? "income"
          : "expense";
      const amount = Math.abs(rawAmount || 0);
      if (!date || !merchant || !amount) return Promise.resolve(null);
      return transactionsAPI
        .create({ date, merchant, description, amount, category, type })
        .catch(() => null);
    });
    await Promise.all(requests);
    await fetchDashboardData();
  };

  const handleSaveTransaction = async (transaction: any) => {
    try {
      if (editingTransaction) {
        await transactionsAPI.update(editingTransaction.id, transaction);
      } else {
        await transactionsAPI.create(transaction);
      }
      await fetchDashboardData();
      setShowTransactionModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error("❌ Failed to save transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  // Loading screen
  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const hasAlerts =
    hasTransactions &&
    (budgetComparisonData.some((b) => b.spent > b.budget) ||
      (stats.expensesChange !== null && stats.expensesChange > 20));

  return (
    <>
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
        mode={editingTransaction ? "edit" : "add"}
      />
      <CSVImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onImport={handleImportTransactions}
        requiredHeaders={["Date", "Merchant", "Description", "Amount", "Category", "Type"]}
        title="Import Transactions from CSV"
        description="Upload a CSV export from your bank. Make sure it includes Date, Merchant, Description, Amount, Category, and Type columns."
        maxFileSize={10}
        sampleData={[
          { Date: "2024-01-15", Merchant: "Starbucks", Description: "Morning coffee", Amount: -5.5, Category: "Food & Dining", Type: "expense" },
          { Date: "2024-01-15", Merchant: "Salary", Description: "Monthly salary", Amount: 5000, Category: "Income", Type: "income" },
          { Date: "2024-01-16", Merchant: "Uber", Description: "Ride to work", Amount: -15, Category: "Transportation", Type: "expense" },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-1 text-3xl font-bold text-gray-900">
                  {userName ? `Welcome back, ${userName} 👋` : "Dashboard"}
                </h1>
                <div className="flex items-center gap-3">
                  <p className="text-gray-600">Your financial overview at a glance</p>
                  {lastUpdated && (
                    <span className="text-xs text-gray-400">
                      · Updated{" "}
                      {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => router.push("/advanced-features")}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-700 px-4 py-2 font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-emerald-800"
                >
                  <Zap className="h-4 w-4" />
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">NEW</span>
                  Advanced Features
                </button>
                <button
                  onClick={() => router.push("/transactions")}
                  className="rounded-lg border-2 border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View Transactions
                </button>
                <button
                  onClick={() => router.push("/goals-budgets")}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-blue-800"
                >
                  Goals & Budgets
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {loadingData ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600" />
              <p className="text-gray-600">Loading your financial data...</p>
            </div>
          ) : (
            <div className="space-y-8">

              {/* Onboarding banner for new users */}
              {!hasTransactions && (
                <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="mb-1 text-lg font-bold text-indigo-900">
                        🎉 Welcome to FinTrack!
                      </h2>
                      <p className="text-sm text-indigo-700">
                        Get started by adding your first transaction or importing from your bank.
                        Your charts and insights will appear here once you have data.
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-3">
                      <button
                        onClick={handleAddTransaction}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                      >
                        + Add Transaction
                      </button>
                      <button
                        onClick={() => setShowCsvModal(true)}
                        className="rounded-lg border-2 border-indigo-300 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        Import CSV
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Stat Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {hasTransactions ? (
                  <>
                    {/* ✅ Pass incomeChange directly — null means no badge shown in StatCard */}
                    <StatCard
                      title="Total Income"
                      value={formatCurrency(stats.totalIncome)}
                      change={stats.incomeChange}
                      icon={TrendingUp}
                      color="from-green-500 to-green-600"
                      description={
                        stats.incomeChange === null
                          ? "This month · No previous data"
                          : `This month · ${stats.incomeChange >= 0 ? "+" : ""}${stats.incomeChange.toFixed(1)}% vs last month`
                      }
                    />
                    {/* ✅ Pass expensesChange directly — null means no badge shown in StatCard */}
                    <StatCard
                      title="Total Expenses"
                      value={formatCurrency(stats.totalExpenses)}
                      change={stats.expensesChange}
                      icon={TrendingDown}
                      color="from-red-500 to-red-600"
                      description={
                        stats.expensesChange === null
                          ? "This month · No previous data"
                          : `This month · ${stats.expensesChange >= 0 ? "+" : ""}${stats.expensesChange.toFixed(1)}% vs last month`
                      }
                    />
                    <StatCard
                      title="Net Savings"
                      value={formatCurrency(stats.totalSavings)}
                      icon={PiggyBank}
                      color="from-blue-500 to-blue-600"
                      description="Income - Expenses"
                    />
                    <StatCard
                      title="Net Worth"
                      value={formatCurrency(stats.netWorth)}
                      icon={Wallet}
                      color="from-purple-500 to-purple-600"
                      description="Goals + Savings"
                    />
                  </>
                ) : (
                  <>
                    <EmptyStatCard
                      title="Total Income"
                      description="No income recorded yet"
                      action={handleAddTransaction}
                      actionLabel="Add income"
                    />
                    <EmptyStatCard
                      title="Total Expenses"
                      description="No expenses recorded yet"
                      action={handleAddTransaction}
                      actionLabel="Add expense"
                    />
                    <EmptyStatCard
                      title="Net Savings"
                      description="Add transactions to see savings"
                      action={() => setShowCsvModal(true)}
                      actionLabel="Import CSV"
                    />
                    <EmptyStatCard
                      title="Net Worth"
                      description="Set goals to track net worth"
                      action={() => router.push("/goals-budgets?tab=goals")}
                      actionLabel="Create a goal"
                    />
                  </>
                )}
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SpendingTrendChart data={spendingTrendData} />
                <BudgetComparisonChart data={budgetComparisonData} />
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {categoryData.length > 0 ? (
                  <CategoryPieChart data={categoryData} />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
                    <BarChart3 className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="font-semibold text-gray-400">Spending by Category</p>
                    <p className="mt-1 text-sm text-gray-400">
                      Add expense transactions to see your spending breakdown
                    </p>
                    <button
                      onClick={handleAddTransaction}
                      className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      + Add Expense
                    </button>
                  </div>
                )}

                {goals.length > 0 ? (
                  <GoalProgressChart goals={goals} />
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center">
                    <Target className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="font-semibold text-gray-400">Savings Goals Progress</p>
                    <p className="mt-1 text-sm text-gray-400">
                      No active goals yet. Create a goal to start tracking your progress.
                    </p>
                    <button
                      onClick={() => router.push("/goals-budgets?tab=goals")}
                      className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      + Create Goal
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-xl">
                <h3 className="mb-4 text-2xl font-bold">Quick Actions</h3>

                {/* Advanced Tools */}
                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-bold">NEW</span>
                    <span className="text-sm font-semibold">Advanced Financial Tools</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { icon: TrendingUp, label: "Cash Flow Forecast", sub: "Predict future balance", tab: "forecast" },
                      { icon: BarChart3, label: "Investments", sub: "Track your portfolio", tab: "investments" },
                      { icon: CreditCard, label: "Debt Payoff", sub: "Plan your debt freedom", tab: "debt" },
                      { icon: Lock, label: "Bank Connect", sub: "Link your accounts", tab: "plaid" },
                    ].map(({ icon: Icon, label, sub, tab }) => (
                      <button
                        key={tab}
                        onClick={() => router.push(`/advanced-features?tab=${tab}`)}
                        className="rounded-xl border-2 border-green-300 bg-gradient-to-br from-green-500/40 to-emerald-500/40 p-4 text-left shadow-lg backdrop-blur-sm transition-all hover:from-green-500/50 hover:to-emerald-500/50"
                      >
                        <Icon className="mb-2 h-8 w-8" />
                        <p className="font-semibold">{label}</p>
                        <p className="text-sm text-blue-100">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="my-6 h-px bg-white/20" />

                {/* Essential Tools */}
                <div>
                  <div className="mb-3 text-sm font-semibold opacity-90">Essential Tools</div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { icon: DollarSign, label: "Add Transaction", sub: "Record income or expense", action: handleAddTransaction },
                      { icon: Upload, label: "Import CSV", sub: "Upload from bank", action: () => setShowCsvModal(true) },
                      { icon: Wallet, label: "Set Budget", sub: "Update spending limits", action: () => router.push("/goals-budgets?tab=budgets") },
                      { icon: BarChart3, label: "View Reports", sub: "See insights", action: () => router.push("/reports") },
                      { icon: Camera, label: "Scan Receipt", sub: "Extract from photos", action: () => router.push("/receipts") },
                      { icon: Brain, label: "AI Insights", sub: "Smart analysis", action: () => router.push("/insights") },
                      { icon: Activity, label: "Health Score", sub: "Check wellness", action: () => router.push("/health") },
                      { icon: RefreshCw, label: "Recurring", sub: "Manage subscriptions", action: () => router.push("/health?tab=recurring") },
                    ].map(({ icon: Icon, label, sub, action }) => (
                      <button
                        key={label}
                        onClick={action}
                        className="rounded-xl bg-white/20 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/30"
                      >
                        <Icon className="mb-2 h-8 w-8" />
                        <p className="font-semibold">{label}</p>
                        <p className="text-sm text-blue-100">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Financial Alerts — only shown when relevant */}
              {hasAlerts && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600" />
                    <div>
                      <h3 className="mb-2 font-bold text-amber-900">Financial Alerts</h3>
                      <ul className="space-y-2 text-sm text-amber-800">
                        {budgetComparisonData
                          .filter((b) => b.spent > b.budget)
                          .map((b, i) => (
                            <li key={i}>
                              •{" "}
                              <span className="font-semibold">{b.category}</span> is over budget by{" "}
                              {formatCurrency(b.spent - b.budget)}
                            </li>
                          ))}
                        {stats.expensesChange !== null && stats.expensesChange > 20 && (
                          <li>
                            • Your expenses increased by {stats.expensesChange.toFixed(1)}% this month
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </main>
      </div>
    </>
  );
}
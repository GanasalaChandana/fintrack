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
} from "lucide-react";

import { SpendingTrendChart } from "@/components/dashboard/SpendingTrendChart";
import { BudgetComparisonChart } from "@/components/dashboard/BudgetComparisonChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { GoalProgressChart } from "@/components/dashboard/GoalProgressChart";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionModal } from "@/components/modals/TransactionModal";
import {
  CSVImportModal,
  type CSVRow,
} from "@/components/CSVImportModal";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

// ✅ IMPORT CENTRALIZED API FUNCTIONS
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

/* ===================== Main Dashboard ===================== */
export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);

  // Data states
  const [spendingTrendData, setSpendingTrendData] = useState<any[]>([]);
  const [budgetComparisonData, setBudgetComparisonData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    netWorth: 0,
    incomeChange: 0,
    expensesChange: 0,
  });

  // CSV modal state
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Transaction modal state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  // Keyboard shortcuts modal state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // ✅ IMPROVED AUTH CHECK using centralized function
  useEffect(() => {
    console.log('🔍 Dashboard mounted - checking authentication...');
    
    if (typeof window !== "undefined") {
      const authenticated = checkAuth();
      console.log('🔐 Authentication status:', authenticated ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');
      
      if (!authenticated) {
        console.log('❌ No valid token, redirecting to login...');
        router.replace("/register?mode=signin&reason=session_required");
      } else {
        console.log('✅ User is authenticated, loading dashboard...');
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }
  }, [router]);

  const processSpendingTrend = (transactions: any[]) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      const monthTransactions = transactions.filter((t) =>
        t.date?.startsWith(monthKey),
      );

      const income = monthTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        month: months[date.getMonth()],
        income,
        expenses,
        savings: income - expenses,
      });
    }

    return data;
  };

  const processBudgetComparison = (budgets: any[]) => {
    return budgets.map((b) => ({
      category: b.category,
      budget: b.budget,
      spent: b.spent,
      remaining: Math.max(b.budget - b.spent, 0),
    }));
  };

  const processCategoryBreakdown = (transactions: any[]) => {
    const categoryMap = new Map<string, number>();

    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];

    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const calculateStats = (transactions: any[], trendData: any[], goalsList: any[]) => {
    const thisMonth = trendData[trendData.length - 1] || {
      income: 0,
      expenses: 0,
    };
    const lastMonth = trendData[trendData.length - 2] || {
      income: 0,
      expenses: 0,
    };

    const totalIncome = thisMonth.income;
    const totalExpenses = thisMonth.expenses;
    const totalSavings = totalIncome - totalExpenses;

    const incomeChange =
      lastMonth.income > 0
        ? ((thisMonth.income - lastMonth.income) / lastMonth.income) * 100
        : 0;

    const expensesChange =
      lastMonth.expenses > 0
        ? ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100
        : 0;

    const goalsSavings = goalsList.reduce(
      (sum, g) => sum + (g.current || 0),
      0,
    );
    const netWorth = goalsSavings + totalSavings;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      netWorth,
      incomeChange,
      expensesChange,
    };
  };

  // ✅ FETCH DATA using centralized API functions
  const fetchDashboardData = useCallback(async () => {
    console.log('📊 Fetching dashboard data...');
    setLoadingData(true);
    
    try {
      // Use centralized API functions
      const [transactions, budgets] = await Promise.all([
        transactionsAPI.getAll().catch((err) => {
          console.error('❌ Failed to fetch transactions:', err);
          return [];
        }),
        budgetsAPI.getAll().catch((err) => {
          console.error('❌ Failed to fetch budgets:', err);
          return [];
        }),
      ]);

      console.log('✅ Fetched transactions:', transactions.length);
      console.log('✅ Fetched budgets:', budgets.length);

      const trendData = processSpendingTrend(transactions);
      setSpendingTrendData(trendData);

      const budgetData = processBudgetComparison(budgets);
      setBudgetComparisonData(budgetData);

      const catData = processCategoryBreakdown(transactions);
      setCategoryData(catData);

      // Set goals to empty array since we're not fetching them
      const goalsData: any[] = [];
      setGoals(goalsData);

      const calculatedStats = calculateStats(
        transactions,
        trendData,
        goalsData,
      );
      setStats(calculatedStats);
      
      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error("❌ Failed to fetch dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  // ✅ KEYBOARD SHORTCUTS HANDLER
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Show keyboard shortcuts modal with Shift + ?
      if (e.shiftKey && e.key === '?') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }

      // Handle other shortcuts with Ctrl/Cmd
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            setEditingTransaction(null);
            setShowTransactionModal(true);
            break;
          case 'k':
            e.preventDefault();
            document.querySelector<HTMLInputElement>('input[type="search"]')?.focus();
            break;
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'b':
            e.preventDefault();
            router.push('/goals-budgets?tab=budgets');
            break;
          case 't':
            e.preventDefault();
            router.push('/transactions');
            break;
          case 'r':
            e.preventDefault();
            router.push('/reports');
            break;
          case 'g':
            e.preventDefault();
            router.push('/goals-budgets?tab=goals');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [router]);

  // ✅ CSV IMPORT using centralized API
  const handleImportTransactions = async (rows: CSVRow[]): Promise<void> => {
    console.log('📥 Importing', rows.length, 'transactions from CSV...');
    
    const normalizeString = (value: unknown) =>
      (value ?? "").toString().trim();

    const requests = rows.map((row) => {
      const date = normalizeString(row["Date"] ?? row["date"]);
      const merchant = normalizeString(row["Merchant"] ?? row["merchant"]);
      const description = normalizeString(
        row["Description"] ?? row["description"] ?? merchant,
      );
      const category = normalizeString(
        row["Category"] ?? row["category"] ?? "Other",
      );

      const rawAmount = Number(row["Amount"] ?? row["amount"] ?? 0);
      const typeRaw = normalizeString(row["Type"] ?? row["type"]);
      const inferredType =
        typeRaw.toLowerCase() === "income" ||
        typeRaw.toLowerCase() === "credit"
          ? "income"
          : "expense";

      const type = inferredType as "income" | "expense";
      const amount = Math.abs(rawAmount || 0);

      if (!date || !merchant || !amount) {
        return Promise.resolve();
      }

      // Use centralized API function
      return transactionsAPI.create({
        date,
        merchant,
        description,
        amount,
        category,
        type,
      }).catch(err => {
        console.error('❌ Failed to create transaction:', err);
        return null;
      });
    });

    await Promise.all(requests);
    console.log('✅ CSV import complete, refreshing data...');
    await fetchDashboardData();
  };

  // ✅ TRANSACTION MODAL using centralized API
  const handleSaveTransaction = async (transaction: any) => {
    console.log('💾 Saving transaction:', transaction);
    
    try {
      if (editingTransaction) {
        // Update existing transaction
        await transactionsAPI.update(editingTransaction.id, transaction);
        console.log('✅ Transaction updated');
      } else {
        // Create new transaction
        await transactionsAPI.create(transaction);
        console.log('✅ Transaction created');
      }

      await fetchDashboardData();
      setShowTransactionModal(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('❌ Failed to save transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };

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

  return (
    <>
      {/* Global keyboard shortcuts - FIXED */}
      <KeyboardShortcuts 
        isOpen={showKeyboardShortcuts} 
        onClose={() => setShowKeyboardShortcuts(false)} 
      />

      {/* Transaction Modal */}
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

      {/* CSV Import Modal */}
      <CSVImportModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onImport={handleImportTransactions}
        requiredHeaders={["Date", "Merchant", "Description", "Amount", "Category", "Type"]}
        title="Import Transactions from CSV"
        description="Upload a CSV export from your bank. Make sure it includes Date, Merchant, Description, Amount, Category, and Type columns."
        maxFileSize={10}
        sampleData={[
          {
            Date: "2024-01-15",
            Merchant: "Starbucks",
            Description: "Morning coffee",
            Amount: -5.5,
            Category: "Food & Dining",
            Type: "expense",
          },
          {
            Date: "2024-01-15",
            Merchant: "Salary",
            Description: "Monthly salary",
            Amount: 5000,
            Category: "Income",
            Type: "income",
          },
          {
            Date: "2024-01-16",
            Merchant: "Uber",
            Description: "Ride to work",
            Amount: -15,
            Category: "Transportation",
            Type: "expense",
          },
        ]}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="mb-1 text-3xl font-bold text-gray-900">
                  Dashboard
                </h1>
                <p className="text-gray-600">
                  Your financial overview at a glance
                </p>
              </div>
              <div className="flex gap-3">
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
              <p className="text-gray-600">Loading data...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Income"
                  value={formatCurrency(stats.totalIncome)}
                  change={stats.incomeChange}
                  icon={TrendingUp}
                  color="from-green-500 to-green-600"
                  description="This month"
                />
                <StatCard
                  title="Total Expenses"
                  value={formatCurrency(stats.totalExpenses)}
                  change={stats.expensesChange}
                  icon={TrendingDown}
                  color="from-red-500 to-red-600"
                  description="This month"
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
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <SpendingTrendChart data={spendingTrendData} />
                <BudgetComparisonChart data={budgetComparisonData} />
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CategoryPieChart data={categoryData} />
                <GoalProgressChart goals={goals} />
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white shadow-xl">
                <h3 className="mb-4 text-2xl font-bold">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  {/* Add Transaction */}
                  <button
                    onClick={() => setShowTransactionModal(true)}
                    className="rounded-xl bg-white/20 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/30"
                  >
                    <DollarSign className="mb-2 h-8 w-8" />
                    <p className="font-semibold">Add Transaction</p>
                    <p className="text-sm text-blue-100">
                      Record income or expense
                    </p>
                  </button>

                  {/* Import CSV */}
                  <button
                    onClick={() => setShowCsvModal(true)}
                    className="rounded-xl bg-white/20 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/30"
                  >
                    <Upload className="mb-2 h-8 w-8" />
                    <p className="font-semibold">Import CSV</p>
                    <p className="text-sm text-blue-100">
                      Upload transactions from your bank
                    </p>
                  </button>

                  {/* Set Budget */}
                  <button
                    onClick={() => router.push("/goals-budgets?tab=budgets")}
                    className="rounded-xl bg-white/20 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/30"
                  >
                    <Wallet className="mb-2 h-8 w-8" />
                    <p className="font-semibold">Set Budget</p>
                    <p className="text-sm text-blue-100">
                      Create or update spending limits
                    </p>
                  </button>

                  {/* View Reports */}
                  <button
                    onClick={() => router.push("/reports")}
                    className="rounded-xl bg-white/20 p-4 text-left backdrop-blur-sm transition-all hover:bg-white/30"
                  >
                    <BarChart3 className="mb-2 h-8 w-8" />
                    <p className="font-semibold">View Reports</p>
                    <p className="text-sm text-blue-100">
                      See insights and trends
                    </p>
                  </button>
                </div>
              </div>

              {/* Alerts Section */}
              {(budgetComparisonData.some((b) => b.spent > b.budget) ||
                stats.expensesChange > 20) && (
                <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="mt-1 h-6 w-6 flex-shrink-0 text-amber-600" />
                    <div>
                      <h3 className="mb-2 font-bold text-amber-900">
                        Financial Alerts
                      </h3>
                      <ul className="space-y-2 text-sm text-amber-800">
                        {budgetComparisonData
                          .filter((b) => b.spent > b.budget)
                          .map((b, i) => (
                            <li key={i}>
                              •{" "}
                              <span className="font-semibold">
                                {b.category}
                              </span>{" "}
                              is over budget by{" "}
                              {formatCurrency(b.spent - b.budget)}
                            </li>
                          ))}
                        {stats.expensesChange > 20 && (
                          <li>
                            • Your expenses increased by{" "}
                            {stats.expensesChange.toFixed(1)}% this month
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
"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  PiggyBank,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { SpendingTrendChart } from "@/components/dashboard/SpendingTrendChart";
import { BudgetComparisonChart } from "@/components/dashboard/BudgetComparisonChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { GoalProgressChart } from "@/components/dashboard/GoalProgressChart";
import { StatCard } from "@/components/dashboard/StatCard";

/* ===================== API Helper ===================== */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ft_token') || localStorage.getItem('authToken');
};

const apiRequest = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('ft_token');
      localStorage.removeItem('authToken');
      window.location.href = '/register?mode=signin';
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  return response.json();
};

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

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = getToken();
      if (!token) {
        router.replace('/register?mode=signin');
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }
  }, [router]);

  // Fetch all data
  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Fetch in parallel
      const [transactions, budgets, goalsData] = await Promise.all([
        apiRequest<any[]>('/api/transactions').catch(() => []),
        apiRequest<any[]>('/api/budgets').catch(() => []),
        apiRequest<any[]>('/api/goals').catch(() => []),
      ]);

      // Process spending trend data (last 6 months)
      const trendData = processSpendingTrend(transactions);
      setSpendingTrendData(trendData);

      // Process budget comparison
      const budgetData = processBudgetComparison(budgets);
      setBudgetComparisonData(budgetData);

      // Process category breakdown
      const catData = processCategoryBreakdown(transactions);
      setCategoryData(catData);

      // Set goals
      setGoals(goalsData);

      // Calculate stats
      const calculatedStats = calculateStats(transactions, trendData);
      setStats(calculatedStats);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const processSpendingTrend = (transactions: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthTransactions = transactions.filter(t => t.date?.startsWith(monthKey));
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
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
    return budgets.map(b => ({
      category: b.category,
      budget: b.budget,
      spent: b.spent,
      remaining: Math.max(b.budget - b.spent, 0),
    }));
  };

  const processCategoryBreakdown = (transactions: any[]) => {
    const categoryMap = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    
    return Array.from(categoryMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  const calculateStats = (transactions: any[], trendData: any[]) => {
    const thisMonth = trendData[trendData.length - 1] || { income: 0, expenses: 0 };
    const lastMonth = trendData[trendData.length - 2] || { income: 0, expenses: 0 };

    const totalIncome = thisMonth.income;
    const totalExpenses = thisMonth.expenses;
    const totalSavings = totalIncome - totalExpenses;

    const incomeChange = lastMonth.income > 0 
      ? ((thisMonth.income - lastMonth.income) / lastMonth.income) * 100 
      : 0;
    
    const expensesChange = lastMonth.expenses > 0 
      ? ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100 
      : 0;

    // Calculate net worth (simplified: sum of all savings goals + current month savings)
    const goalsSavings = goals.reduce((sum, g) => sum + (g.current || 0), 0);
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

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
              <p className="text-gray-600">Your financial overview at a glance</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/transactions')}
                className="px-4 py-2 text-gray-700 bg-white border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                View Transactions
              </button>
              <button
                onClick={() => router.push('/goals-budgets')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
                Goals & Budgets
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {loadingData ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SpendingTrendChart data={spendingTrendData} />
              <BudgetComparisonChart data={budgetComparisonData} />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryPieChart data={categoryData} />
              <GoalProgressChart goals={goals} />
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/transactions?action=add')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
                >
                  <DollarSign className="w-8 h-8 mb-2" /><p className="font-semibold">Add Transaction</p>
                  <p className="text-sm text-blue-100">Record income or expense</p>
                </button>
                <button
                  onClick={() => router.push('/goals-budgets?tab=goals')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
                >
                  <Target className="w-8 h-8 mb-2" />
                  <p className="font-semibold">Create Goal</p>
                  <p className="text-sm text-blue-100">Set a new savings target</p>
                </button>
                <button
                  onClick={() => router.push('/goals-budgets?tab=budgets')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-xl p-4 text-left transition-all"
                >
                  <Wallet className="w-8 h-8 mb-2" />
                  <p className="font-semibold">Add Budget</p>
                  <p className="text-sm text-blue-100">Set spending limits</p>
                </button>
              </div>
            </div>

            {/* Alerts Section */}
            {(budgetComparisonData.some(b => b.spent > b.budget) || 
              stats.expensesChange > 20) && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-amber-900 mb-2">Financial Alerts</h3>
                    <ul className="space-y-2 text-sm text-amber-800">
                      {budgetComparisonData.filter(b => b.spent > b.budget).map((b, i) => (
                        <li key={i}>
                          • <span className="font-semibold">{b.category}</span> is over budget by {formatCurrency(b.spent - b.budget)}
                        </li>
                      ))}
                      {stats.expensesChange > 20 && (
                        <li>• Your expenses increased by {stats.expensesChange.toFixed(1)}% this month</li>
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
  );
}
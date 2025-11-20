"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  type LucideIcon,
} from "lucide-react";

/* ---------- Types ---------- */

type ReportTab = "monthly" | "comparison" | "forecast";

interface MonthPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  target: number;
}

interface CategoryRow {
  name: string;
  amount: number;
  budget: number;
  percentage: number;
  color: string;
}

interface SavingsGoal {
  name: string;
  current: number;
  target: number;
  progress: number; // 0-100
  color: string;
}

interface TopExpense {
  vendor: string;
  category: string;
  amount: number;
  frequency: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string; // Tailwind bg classes
}

/* ---------- Mock data ---------- */

const monthlyData: MonthPoint[] = [
  { month: "Jan", income: 5200, expenses: 3800, savings: 1400, target: 1500 },
  { month: "Feb", income: 5200, expenses: 4100, savings: 1100, target: 1500 },
  { month: "Mar", income: 5400, expenses: 3900, savings: 1500, target: 1500 },
  { month: "Apr", income: 5200, expenses: 3600, savings: 1600, target: 1500 },
  { month: "May", income: 5600, expenses: 4200, savings: 1400, target: 1500 },
  { month: "Jun", income: 5200, expenses: 3500, savings: 1700, target: 1500 },
];

const categoryBreakdown: CategoryRow[] = [
  { name: "Food & Dining", amount: 1250, budget: 1000, percentage: 28, color: "#3b82f6" },
  { name: "Transportation", amount: 450, budget: 500, percentage: 10, color: "#8b5cf6" },
  { name: "Shopping", amount: 680, budget: 700, percentage: 15, color: "#ec4899" },
  { name: "Entertainment", amount: 320, budget: 400, percentage: 7, color: "#f59e0b" },
  { name: "Bills & Utilities", amount: 850, budget: 900, percentage: 19, color: "#10b981" },
  { name: "Healthcare", amount: 280, budget: 300, percentage: 6, color: "#ef4444" },
  { name: "Others", amount: 670, budget: 700, percentage: 15, color: "#6b7280" },
];

const savingsGoals: SavingsGoal[] = [
  { name: "Emergency Fund", current: 8500, target: 10000, progress: 85, color: "#10b981" },
  { name: "Vacation", current: 2300, target: 5000, progress: 46, color: "#3b82f6" },
  { name: "New Car", current: 12000, target: 25000, progress: 48, color: "#f59e0b" },
];

const topExpenses: TopExpense[] = [
  { vendor: "Whole Foods", category: "Groceries", amount: 456.8, frequency: 12 },
  { vendor: "Amazon", category: "Shopping", amount: 389.99, frequency: 8 },
  { vendor: "Shell Gas", category: "Transportation", amount: 320.5, frequency: 15 },
  { vendor: "Netflix", category: "Entertainment", amount: 15.99, frequency: 1 },
  { vendor: "Electric Company", category: "Utilities", amount: 145.0, frequency: 1 },
];

/* ---------- Utils ---------- */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

/* ---------- Small UI pieces ---------- */

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && change && (
        <div
          className={`flex items-center gap-1 text-sm font-bold ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {change}
        </div>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

/* ---------- Page ---------- */

const FinancialReports: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedReport, setSelectedReport] = useState<ReportTab>("monthly");
  const [dateRange, setDateRange] = useState<
    "last-7-days" | "last-30-days" | "last-3-months" | "last-6-months" | "last-year" | "custom"
  >("last-30-days");

  // Auth check
  useEffect(() => {
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

  const renderMonthlyReport = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Net Income"
          value={formatCurrency(5200)}
          change="5.2%"
          trend="up"
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(3500)}
          change="8.3%"
          trend="down"
          icon={TrendingDown}
          color="bg-gradient-to-br from-red-500 to-red-600"
        />
        <StatCard
          title="Net Savings"
          value={formatCurrency(1700)}
          change="13.3%"
          trend="up"
          icon={Target}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Savings Rate"
          value="32.7%"
          change="2.1%"
          trend="up"
          icon={Award}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Income vs Expenses Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Income vs Expenses</h3>
            <p className="text-sm text-gray-500">6-month trend analysis</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg">
              6 Months
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
              1 Year
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: 8 }}
              formatter={(v: number) => formatCurrency(v)}
            />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2} />
            <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown & Top Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Spending by Category</h3>
          <div className="space-y-4">
            {categoryBreakdown.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">{formatCurrency(category.amount)}</span>
                    <span
                      className={`font-semibold ${
                        category.amount > category.budget ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {category.percentage}%
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((category.amount / category.budget) * 100, 100)}%`,
                        backgroundColor: category.amount > category.budget ? "#ef4444" : category.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Budget: {formatCurrency(category.budget)}</span>
                    {category.amount > category.budget && (
                      <span className="text-red-600 font-semibold">
                        Over by {formatCurrency(category.amount - category.budget)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Top Expenses This Month</h3>
          <div className="space-y-3">
            {topExpenses.map((expense, idx) => (
              <div
                key={expense.vendor}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{expense.vendor}</div>
                    <div className="text-xs text-gray-500">
                      {expense.category} • {expense.frequency}x
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{formatCurrency(expense.amount)}</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(expense.amount / expense.frequency)}/transaction
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Savings Goals Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => (
            <div key={goal.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                <span className="text-sm font-bold" style={{ color: goal.color }}>
                  {goal.progress}%
                </span>
              </div>
              <div className="relative pt-1">
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{formatCurrency(goal.current)}</span>
                <span className="font-semibold">{formatCurrency(goal.target)}</span>
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(goal.target - goal.current)} remaining
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Key Insights for This Month</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">✓</span>
                <span>
                  You saved <strong>$200 more</strong> than your target this month. Great job!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">!</span>
                <span>
                  Food &amp; Dining expenses are <strong>25% over budget</strong>. Consider meal
                  planning to reduce costs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">→</span>
                <span>
                  You&apos;re on track to reach your Emergency Fund goal in <strong>2 months</strong>{" "}
                  at this rate.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">⚡</span>
                <span>
                  Shopping expenses decreased by <strong>15%</strong> compared to last month. Keep it
                  up!
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Financial Reports</h1>
              <p className="text-gray-600">Comprehensive analysis of your financial health</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
                <Download className="w-4 h-4" />
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "monthly", label: "Monthly Overview", icon: DollarSign },
              { id: "comparison", label: "Period Comparison", icon: TrendingUp },
              { id: "forecast", label: "Forecast", icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id as ReportTab)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  selectedReport === (tab.id as ReportTab)
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedReport === "monthly" && renderMonthlyReport()}
        {selectedReport === "comparison" && (
          <div className="text-center py-20">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Period Comparison</h3>
            <p className="text-gray-600">Compare your financial metrics across different time periods</p>
          </div>
        )}
        {selectedReport === "forecast" && (
          <div className="text-center py-20">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Financial Forecast</h3>
            <p className="text-gray-600">AI-powered predictions of your future financial trajectory</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FinancialReports;
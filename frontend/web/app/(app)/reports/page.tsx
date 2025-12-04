"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Loader2,
  type LucideIcon,
} from "lucide-react";

import { isAuthenticated } from "@/lib/api";
import {
  reportsService,
  type ReportsData,
  type ReportsRange,
} from "@/lib/api/services/reports.service";

// ✅ advanced charts
import {
  IncomeExpenseComparison,
  SpendingPatternRadar,
  TransactionScatter,
} from "@/components/charts/AdvancedCharts";

/* ---------- Types ---------- */

type ReportTab = "monthly" | "comparison" | "forecast";

type DateRange =
  | "last-7-days"
  | "last-30-days"
  | "last-3-months"
  | "last-6-months"
  | "last-year"
  | "custom";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
}

/* ---------- Utils ---------- */

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);

const formatPercentage = (value: number) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

/* ---------- Small UI pieces ---------- */

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}) => (
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
          {trend === "up" ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          {change}
        </div>
      )}
    </div>
    <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
  </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
    <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
    <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Data</h3>
    <p className="text-red-700 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

/* ---------- Page ---------- */

const FinancialReports: React.FC = () => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [selectedReport, setSelectedReport] = useState<ReportTab>("monthly");
  const [dateRange, setDateRange] = useState<DateRange>("last-30-days");

  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // ✅ Add abort controller ref to cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // ✅ Add ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Auth check – uses shared helper (respects localStorage + cookie)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isAuthenticated()) {
      router.replace("/register?mode=signin");
    } else {
      setIsAuth(true);
      setIsCheckingAuth(false);
    }
  }, [router]);

  // ✅ FIX: Memoize fetchReportsData with useCallback
  const fetchReportsData = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (dataLoading) {
      console.log("Request already in progress, skipping...");
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      console.log("Aborting previous request...");
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setDataLoading(true);
    setDataError(null);

    try {
      console.log(`Fetching reports for range: ${dateRange}`);
      const data = await reportsService.getFinancialReports(
        dateRange as ReportsRange,
      );
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setReportsData(data);
        setDataError(null);
        console.log("Reports data loaded successfully");
      }
    } catch (error) {
      // Ignore abort errors
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted");
        return;
      }

      console.error("Error fetching reports:", error);
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setDataError(
          error instanceof Error
            ? error.message
            : "Failed to load reports data",
        );
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setDataLoading(false);
      }
    }
  }, [dateRange, dataLoading]); // ✅ Only depends on dateRange and dataLoading

  // ✅ FIX: Load data when authenticated, date range, or tab changes
  useEffect(() => {
    if (isAuth && selectedReport === "monthly") {
      console.log("Triggering data fetch...");
      void fetchReportsData();
    }

    // Cleanup: abort request on unmount or when effect re-runs
    return () => {
      if (abortControllerRef.current) {
        console.log("Cleanup: aborting request");
        abortControllerRef.current.abort();
      }
    };
  }, [isAuth, selectedReport, fetchReportsData]); // ✅ Now safe to include fetchReportsData

  // ✅ Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      const blob = await reportsService.exportReportPDF(
        dateRange as ReportsRange,
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `financial-report-${dateRange}-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    }
  };

  const renderMonthlyReport = () => {
    if (dataLoading) return <LoadingSpinner />;

    if (dataError)
      return (
        <ErrorMessage message={dataError} onRetry={fetchReportsData} />
      );

    if (!reportsData)
      return (
        <ErrorMessage
          message="No data available"
          onRetry={fetchReportsData}
        />
      );

    const {
      summary,
      monthlyData,
      categoryBreakdown,
      savingsGoals,
      topExpenses,
      insights,
    } = reportsData;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Net Income"
            value={formatCurrency(summary.netIncome)}
            change={formatPercentage(summary.incomeChange)}
            trend={summary.incomeChange >= 0 ? "up" : "down"}
            icon={DollarSign}
            color="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary.totalExpenses)}
            change={formatPercentage(summary.expensesChange)}
            trend={summary.expensesChange <= 0 ? "up" : "down"}
            icon={TrendingDown}
            color="bg-gradient-to-br from-red-500 to-red-600"
          />
          <StatCard
            title="Net Savings"
            value={formatCurrency(summary.netSavings)}
            change={formatPercentage(summary.savingsChange)}
            trend={summary.savingsChange >= 0 ? "up" : "down"}
            icon={Target}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Savings Rate"
            value={`${summary.savingsRate.toFixed(1)}%`}
            change={formatPercentage(summary.savingsRateChange)}
            trend={summary.savingsRateChange >= 0 ? "up" : "down"}
            icon={Award}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
          />
        </div>

        {/* Income vs Expenses Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Income vs Expenses
              </h3>
              <p className="text-sm text-gray-500">
                Trend analysis over selected period
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id="colorExpenses"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                fill="url(#colorIncome)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#ef4444"
                fill="url(#colorExpenses)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown & Top Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Spending by Category
            </h3>
            <div className="space-y-4">
              {categoryBreakdown.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">
                        {formatCurrency(category.amount)}
                      </span>
                      <span
                        className={`font-semibold ${
                          category.amount > category.budget
                            ? "text-red-600"
                            : "text-green-600"
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
                          width: `${Math.min(
                            (category.amount / category.budget) * 100,
                            100,
                          )}%`,
                          backgroundColor:
                            category.amount > category.budget
                              ? "#ef4444"
                              : category.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>
                        Budget: {formatCurrency(category.budget)}
                      </span>
                      {category.amount > category.budget && (
                        <span className="text-red-600 font-semibold">
                          Over by{" "}
                          {formatCurrency(
                            category.amount - category.budget,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Top Expenses This Period
            </h3>
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
                      <div className="font-semibold text-gray-900">
                        {expense.vendor}
                      </div>
                      <div className="text-xs text-gray-500">
                        {expense.category} • {expense.frequency}x
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(
                        expense.amount / expense.frequency,
                      )}
                      /transaction
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Savings Goals */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Savings Goals Progress
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {savingsGoals.map((goal) => (
              <div key={goal.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {goal.name}
                  </h4>
                  <span
                    className="text-sm font-bold"
                    style={{ color: goal.color }}
                  >
                    {goal.progress}%
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${goal.progress}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatCurrency(goal.current)}</span>
                  <span className="font-semibold">
                    {formatCurrency(goal.target)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(goal.target - goal.current)} remaining
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Insights */}
        {insights && insights.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Key Insights
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Example data for advanced charts tab
  const comparisonData = [
    { month: "Jan", income: 5000, expenses: 3500, savings: 1500 },
    { month: "Feb", income: 5200, expenses: 3800, savings: 1400 },
    { month: "Mar", income: 5100, expenses: 3600, savings: 1500 },
    { month: "Apr", income: 5300, expenses: 3900, savings: 1400 },
  ];

  const radarData = [
    { category: "Food", current: 450, previous: 380 },
    { category: "Transport", current: 200, previous: 180 },
    { category: "Shopping", current: 300, previous: 250 },
    { category: "Bills", current: 500, previous: 520 },
    { category: "Entertainment", current: 220, previous: 210 },
  ];

  const scatterData = [
    { day: 1, amount: 45.5, type: "expense", z: 100 },
    { day: 2, amount: 3000, type: "income", z: 200 },
    { day: 3, amount: 120.75, type: "expense", z: 120 },
    { day: 4, amount: 60.2, type: "expense", z: 90 },
    { day: 5, amount: 450, type: "income", z: 150 },
  ];

  // Show loading while checking auth
  if (isCheckingAuth || !isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Financial Reports
              </h1>
              <p className="text-gray-600">
                Comprehensive analysis of your financial health
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) =>
                  setDateRange(e.target.value as DateRange)
                }
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
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
              >
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
              {
                id: "comparison",
                label: "Period Comparison",
                icon: TrendingUp,
              },
              { id: "forecast", label: "Forecast", icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSelectedReport(tab.id as ReportTab)
                }
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
          <div className="space-y-6">
            <IncomeExpenseComparison data={comparisonData} />
            <SpendingPatternRadar data={radarData} />
            <TransactionScatter data={scatterData} />
          </div>
        )}

        {selectedReport === "forecast" && (
          <div className="text-center py-20">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Financial Forecast
            </h3>
            <p className="text-gray-600">
              AI-powered predictions of your future financial trajectory
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default FinancialReports;
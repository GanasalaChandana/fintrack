"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
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
  ChevronRight,
  Calendar,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Settings,
  X,
  Check,
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

type ReportTab = "overview" | "custom" | "trends" | "comparison" | "forecast";

type DateRange =
  | "last-7-days"
  | "last-30-days"
  | "last-3-months"
  | "last-6-months"
  | "last-year"
  | "custom";

type ExportFormat = "pdf" | "csv" | "excel";

type ChartType = "line" | "bar" | "area" | "pie";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  color: string;
}

interface CustomReportConfig {
  name: string;
  dateRange: DateRange;
  metrics: string[];
  groupBy: "day" | "week" | "month" | "category";
  chartType: ChartType;
  includeCategories: string[];
}

interface CategoryDetail {
  name: string;
  total: number;
  transactions: number;
  avgTransaction: number;
  trend: number;
  breakdown: Array<{
    date: string;
    amount: number;
  }>;
  topMerchants: Array<{
    name: string;
    amount: number;
    count: number;
  }>;
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

const COLORS = {
  primary: "#3b82f6",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  indigo: "#6366f1",
  teal: "#14b8a6",
};

const CATEGORY_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", 
  "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
  "#f97316", "#06b6d4", "#84cc16", "#a855f7"
];

/* ---------- Small UI pieces ---------- */

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
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
    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
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
  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
    <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-500 mx-auto mb-3" />
    <h3 className="text-lg font-bold text-red-900 dark:text-red-300 mb-2">Error Loading Data</h3>
    <p className="text-red-700 dark:text-red-400 mb-4">{message}</p>
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

const EnhancedFinancialReports: React.FC = () => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [selectedReport, setSelectedReport] = useState<ReportTab>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("last-30-days");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });

  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Custom Report Builder State
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);
  const [customConfig, setCustomConfig] = useState<CustomReportConfig>({
    name: "My Custom Report",
    dateRange: "last-30-days",
    metrics: ["income", "expenses"],
    groupBy: "month",
    chartType: "line",
    includeCategories: [],
  });

  // Category Deep Dive State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(null);

  // Export State
  const [exportFormat, setExportFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);

  // Auth check
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isAuthenticated()) {
      router.replace("/register?mode=signin");
    } else {
      setIsAuth(true);
      setIsCheckingAuth(false);
    }
  }, [router]);

  // Fetch reports data
  const fetchReportsData = async () => {
    setDataLoading(true);
    setDataError(null);

    try {
      const data = await reportsService.getFinancialReports(
        dateRange as ReportsRange,
      );
      setReportsData(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setDataError(
        error instanceof Error
          ? error.message
          : "Failed to load reports data",
      );
    } finally {
      setDataLoading(false);
    }
  };

  // Load data when authenticated and date range changes
  useEffect(() => {
    if (isAuth) {
      void fetchReportsData();
    }
  }, [isAuth, dateRange]);

  // Handle export with different formats
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      switch (format) {
        case "pdf":
          const pdfBlob = await reportsService.exportReportPDF(dateRange as ReportsRange);
          downloadFile(pdfBlob, `financial-report-${dateRange}.pdf`, "application/pdf");
          break;
        case "csv":
          await exportToCSV();
          break;
        case "excel":
          await exportToExcel();
          break;
      }
    } catch (error) {
      console.error("Error exporting:", error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string, type: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportToCSV = async () => {
    if (!reportsData) return;
    
    let csvContent = "Category,Amount,Budget,Percentage\n";
    reportsData.categoryBreakdown.forEach(cat => {
      csvContent += `${cat.name},${cat.amount},${cat.budget},${cat.percentage}%\n`;
    });
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    downloadFile(blob, `financial-report-${dateRange}.csv`, "text/csv");
  };

  const exportToExcel = async () => {
    // Placeholder for Excel export - would need a library like xlsx
    alert("Excel export will be implemented with xlsx library");
  };

  // Fetch category details
  const fetchCategoryDetail = async (categoryName: string) => {
    // Mock data - replace with actual API call
    const mockDetail: CategoryDetail = {
      name: categoryName,
      total: 1250.50,
      transactions: 24,
      avgTransaction: 52.10,
      trend: -12.5,
      breakdown: [
        { date: "Week 1", amount: 250 },
        { date: "Week 2", amount: 380 },
        { date: "Week 3", amount: 290 },
        { date: "Week 4", amount: 330.50 },
      ],
      topMerchants: [
        { name: "Whole Foods", amount: 450.25, count: 8 },
        { name: "Trader Joe's", amount: 320.50, count: 6 },
        { name: "Target", amount: 280.75, count: 5 },
      ],
    };
    setCategoryDetail(mockDetail);
  };

  const renderOverview = () => {
    if (dataLoading) return <LoadingSpinner />;
    if (dataError) return <ErrorMessage message={dataError} onRetry={fetchReportsData} />;
    if (!reportsData) return <ErrorMessage message="No data available" onRetry={fetchReportsData} />;

    const { summary, monthlyData, categoryBreakdown, savingsGoals, topExpenses, insights } = reportsData;

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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Income vs Expenses
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
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

        {/* Category Breakdown with Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
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
                      <button
                        onClick={() => {
                          setSelectedCategory(category.name);
                          fetchCategoryDetail(category.name);
                        }}
                        className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                      >
                        {category.name}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600 dark:text-gray-400">
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
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((category.amount / category.budget) * 100, 100)}%`,
                          backgroundColor: category.amount > category.budget ? "#ef4444" : category.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Top Expenses This Period
            </h3>
            <div className="space-y-3">
              {topExpenses.map((expense, idx) => (
                <div
                  key={expense.vendor}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {expense.vendor}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {expense.category} • {expense.frequency}x
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(expense.amount / expense.frequency)}/transaction
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Insights */}
        {insights && insights.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  Key Insights
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
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

  const renderCustomReportBuilder = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Build Custom Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Name
              </label>
              <input
                type="text"
                value={customConfig.name}
                onChange={(e) => setCustomConfig({ ...customConfig, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="My Custom Report"
              />
            </div>

            {/* Metrics Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Metrics to Include
              </label>
              <div className="space-y-2">
                {["income", "expenses", "savings", "net-worth"].map((metric) => (
                  <label key={metric} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={customConfig.metrics.includes(metric)}
                      onChange={(e) => {
                        const newMetrics = e.target.checked
                          ? [...customConfig.metrics, metric]
                          : customConfig.metrics.filter((m) => m !== metric);
                        setCustomConfig({ ...customConfig, metrics: newMetrics });
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{metric.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Chart Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <select
                value={customConfig.chartType}
                onChange={(e) => setCustomConfig({ ...customConfig, chartType: e.target.value as ChartType })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>

            {/* Group By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group By
              </label>
              <select
                value={customConfig.groupBy}
                onChange={(e) => setCustomConfig({ ...customConfig, groupBy: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="category">By Category</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={customConfig.dateRange}
                onChange={(e) => setCustomConfig({ ...customConfig, dateRange: e.target.value as DateRange })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                // Generate report logic here
                alert("Custom report generated!");
              }}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Report
            </button>
            <button
              onClick={() => setCustomConfig({
                name: "My Custom Report",
                dateRange: "last-30-days",
                metrics: ["income", "expenses"],
                groupBy: "month",
                chartType: "line",
                includeCategories: [],
              })}
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSpendingTrends = () => {
    if (!reportsData) return <LoadingSpinner />;

    // Mock trend data
    const trendData = [
      { month: "Jan", food: 450, transport: 200, shopping: 300, bills: 500 },
      { month: "Feb", food: 480, transport: 180, shopping: 350, bills: 520 },
      { month: "Mar", food: 420, transport: 220, shopping: 280, bills: 500 },
      { month: "Apr", food: 490, transport: 190, shopping: 320, bills: 510 },
      { month: "May", food: 510, transport: 210, shopping: 340, bills: 530 },
      { month: "Jun", food: 470, transport: 200, shopping: 310, bills: 520 },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Spending Trends by Category
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
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
              <Line type="monotone" dataKey="food" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="transport" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="shopping" stroke="#ec4899" strokeWidth={2} />
              <Line type="monotone" dataKey="bills" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">📈 Increasing Trends</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Food & Dining</span>
                <span className="text-red-600 font-semibold">+13.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Shopping</span>
                <span className="text-red-600 font-semibold">+13.3%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-900 dark:text-white mb-4">📉 Decreasing Trends</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Transportation</span>
                <span className="text-green-600 font-semibold">-5.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    const comparisonData = [
      { month: "Jan", current: 3500, previous: 3200 },
      { month: "Feb", current: 3800, previous: 3400 },
      { month: "Mar", current: 3600, previous: 3600 },
      { month: "Apr", current: 3900, previous: 3300 },
      { month: "May", current: 3700, previous: 3500 },
      { month: "Jun", current: 3850, previous: 3450 },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Period Comparison
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
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
              <Bar dataKey="current" fill="#3b82f6" name="This Year" />
              <Bar dataKey="previous" fill="#9ca3af" name="Last Year" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <IncomeExpenseComparison data={comparisonData.map(d => ({ 
          month: d.month, 
          income: 5000, 
          expenses: d.current, 
          savings: 5000 - d.current 
        }))} />
      </div>
    );
  };

  const renderForecast = () => {
    const forecastData = [
      { month: "Jul", actual: 3850, forecast: 3900, confidence: { low: 3700, high: 4100 } },
      { month: "Aug", actual: null, forecast: 3950, confidence: { low: 3750, high: 4150 } },
      { month: "Sep", actual: null, forecast: 4000, confidence: { low: 3800, high: 4200 } },
      { month: "Oct", actual: null, forecast: 4050, confidence: { low: 3850, high: 4250 } },
      { month: "Nov", actual: null, forecast: 4100, confidence: { low: 3900, high: 4300 } },
      { month: "Dec", actual: null, forecast: 4200, confidence: { low: 4000, high: 4400 } },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            6-Month Spending Forecast
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={forecastData}>
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
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
              <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Forecast Insights:</strong> Based on your historical spending patterns, we predict your expenses will gradually increase by approximately 9% over the next 6 months. Consider adjusting your budget accordingly.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Category Deep Dive Modal
  const CategoryDeepDiveModal = () => {
    if (!selectedCategory || !categoryDetail) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCategory}</h2>
              <p className="text-gray-600 dark:text-gray-400">Detailed breakdown and analysis</p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setCategoryDetail(null);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Category Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(categoryDetail.total)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transactions</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoryDetail.transactions}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg per Transaction</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(categoryDetail.avgTransaction)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Trend</div>
                <div className={`text-2xl font-bold ${categoryDetail.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(categoryDetail.trend)}
                </div>
              </div>
            </div>

            {/* Spending Over Time */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Spending Over Time</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryDetail.breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Merchants */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Top Merchants</h3>
              <div className="space-y-3">
                {categoryDetail.topMerchants.map((merchant, idx) => (
                  <div key={merchant.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{merchant.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{merchant.count} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(merchant.amount)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(merchant.amount / merchant.count)}/avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isCheckingAuth || !isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Financial Reports & Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Comprehensive analysis and insights into your financial health
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
              >
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => handleExport(exportFormat)}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Export {exportFormat.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "custom", label: "Custom Reports", icon: Settings },
              { id: "trends", label: "Spending Trends", icon: TrendingUp },
              { id: "comparison", label: "Period Comparison", icon: PieChartIcon },
              { id: "forecast", label: "Forecast", icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedReport(tab.id as ReportTab)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                  selectedReport === (tab.id as ReportTab)
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300"
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
        {selectedReport === "overview" && renderOverview()}
        {selectedReport === "custom" && renderCustomReportBuilder()}
        {selectedReport === "trends" && renderSpendingTrends()}
        {selectedReport === "comparison" && renderComparison()}
        {selectedReport === "forecast" && renderForecast()}
      </main>

      {/* Category Deep Dive Modal */}
      <CategoryDeepDiveModal />
    </div>
  );
};

export default EnhancedFinancialReports;
"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  CartesianGrid, Tooltip, Legend, XAxis, YAxis, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Download, DollarSign, Target, Award,
  AlertCircle, ArrowUp, ArrowDown, Loader2, ChevronRight, Calendar,
  BarChart3, PieChart as PieChartIcon, Settings, X, Sparkles,
  FileText, Eye, type LucideIcon,
} from "lucide-react";
import { isAuthenticated } from "@/lib/api";
import { reportsService, type ReportsData, type ReportsRange } from "@/lib/api/services/reports.service";
import { IncomeExpenseComparison } from "@/components/charts/AdvancedCharts";

// ── Types ─────────────────────────────────────────────────────────────────────

type ReportTab = "overview" | "custom" | "trends" | "comparison" | "forecast";
type DateRange = "last-7-days" | "last-30-days" | "last-3-months" | "last-6-months" | "last-year" | "custom";
type ExportFormat = "pdf" | "csv" | "excel";
type ChartType = "line" | "bar" | "area" | "pie";

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
  breakdown: Array<{ date: string; amount: number }>;
  topMerchants: Array<{ name: string; amount: number; count: number }>;
}

// ── Utils ─────────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);

const fmtPct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  fontSize: 13,
};

// ── Empty State ───────────────────────────────────────────────────────────────

function ChartEmptyState({ message = "Add transactions to see your data here" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <BarChart3 className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-400 text-center">{message}</p>
      <p className="text-xs text-slate-300 mt-1 text-center">Data will appear once you log transactions</p>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  title, value, change, trend, icon: Icon, bgAccent, textAccent,
}: {
  title: string; value: string; change?: string; trend?: "up" | "down" | "neutral";
  icon: LucideIcon; bgAccent: string; textAccent: string;
}) {
  const hasChange = change && trend && trend !== "neutral";
  const isPositive = trend === "up";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${bgAccent}`}>
          <Icon className={`w-5 h-5 ${textAccent}`} />
        </div>
        {hasChange && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
            isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// ── Section Card wrapper ──────────────────────────────────────────────────────

function Card({ title, subtitle, children, accentColor = "#6366f1" }: {
  title?: string; subtitle?: string; children: React.ReactNode; accentColor?: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />
      <div className="p-6">
        {title && (
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );
}

// ── Error ─────────────────────────────────────────────────────────────────────

function ErrorMessage({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-7 h-7 text-red-500" />
      </div>
      <h3 className="text-base font-bold text-red-800 mb-2">Couldn't load data</h3>
      <p className="text-sm text-red-600 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry}
          className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition">
          Try Again
        </button>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const EnhancedFinancialReports: React.FC = () => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportTab>("overview");
  const [dateRange, setDateRange] = useState<DateRange>("last-30-days");
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [exportFormat] = useState<ExportFormat>("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<CategoryDetail | null>(null);
  const [customConfig, setCustomConfig] = useState<CustomReportConfig>({
    name: "My Custom Report",
    dateRange: "last-30-days",
    metrics: ["income", "expenses"],
    groupBy: "month",
    chartType: "line",
    includeCategories: [],
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isAuthenticated()) {
      router.replace("/register?mode=signin");
    } else {
      setIsAuth(true);
      setIsCheckingAuth(false);
    }
  }, [router]);

  const fetchReportsData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const data = await reportsService.getFinancialReports(dateRange as ReportsRange);
      setReportsData(data);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : "Failed to load reports data");
    } finally {
      setDataLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    if (isAuth) void fetchReportsData();
  }, [isAuth, fetchReportsData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await reportsService.exportReportPDF(dateRange as ReportsRange);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `report-${dateRange}.pdf`;
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } catch { alert("Export failed. Please try again."); }
    finally { setIsExporting(false); }
  };

  const fetchCategoryDetail = (categoryName: string) => {
    const mock: CategoryDetail = {
      name: categoryName, total: 1250.50, transactions: 24,
      avgTransaction: 52.10, trend: -12.5,
      breakdown: [
        { date: "Week 1", amount: 250 }, { date: "Week 2", amount: 380 },
        { date: "Week 3", amount: 290 }, { date: "Week 4", amount: 330.5 },
      ],
      topMerchants: [
        { name: "Whole Foods", amount: 450.25, count: 8 },
        { name: "Trader Joe's", amount: 320.50, count: 6 },
        { name: "Target", amount: 280.75, count: 5 },
      ],
    };
    setCategoryDetail(mock);
  };

  // ── Tab: Overview ──────────────────────────────────────────────────────────

  const renderOverview = () => {
    if (dataLoading) return <LoadingSpinner />;
    if (dataError) return <ErrorMessage message={dataError} onRetry={fetchReportsData} />;
    if (!reportsData) return <ErrorMessage message="No data available" onRetry={fetchReportsData} />;

    const { summary, monthlyData, categoryBreakdown, topExpenses, insights } = reportsData;
    const hasMonthlyData = monthlyData && monthlyData.length > 0 && monthlyData.some(d => d.income > 0 || d.expenses > 0);
    const hasCategoryData = categoryBreakdown && categoryBreakdown.length > 0;
    const hasTopExpenses = topExpenses && topExpenses.length > 0;

    return (
      <div className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Net Income" value={fmt(summary.netIncome)}
            change={summary.incomeChange !== 0 ? fmtPct(summary.incomeChange) : undefined}
            trend={summary.incomeChange > 0 ? "up" : summary.incomeChange < 0 ? "down" : "neutral"}
            icon={DollarSign} bgAccent="bg-emerald-50" textAccent="text-emerald-600" />
          <StatCard title="Total Expenses" value={fmt(summary.totalExpenses)}
            change={summary.expensesChange !== 0 ? fmtPct(summary.expensesChange) : undefined}
            trend={summary.expensesChange <= 0 ? "up" : "down"}
            icon={TrendingDown} bgAccent="bg-red-50" textAccent="text-red-500" />
          <StatCard title="Net Savings" value={fmt(summary.netSavings)}
            change={summary.savingsChange !== 0 ? fmtPct(summary.savingsChange) : undefined}
            trend={summary.savingsChange >= 0 ? "up" : "down"}
            icon={Target} bgAccent="bg-indigo-50" textAccent="text-indigo-600" />
          <StatCard title="Savings Rate" value={`${summary.savingsRate.toFixed(1)}%`}
            change={summary.savingsRateChange !== 0 ? fmtPct(summary.savingsRateChange) : undefined}
            trend={summary.savingsRateChange >= 0 ? "up" : "down"}
            icon={Award} bgAccent="bg-violet-50" textAccent="text-violet-600" />
        </div>

        {/* Income vs Expenses Chart */}
        <Card title="Income vs Expenses" subtitle="Trend analysis over selected period" accentColor="#6366f1">
          {hasMonthlyData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#gIncome)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" fill="url(#gExpenses)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState message="No income or expense data for this period" />
          )}
        </Card>

        {/* Category + Top Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Spending by Category" accentColor="#f97316">
            {hasCategoryData ? (
              <div className="space-y-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <button
                        onClick={() => { setSelectedCategory(cat.name); fetchCategoryDetail(cat.name); }}
                        className="flex items-center gap-2 font-semibold text-gray-700 hover:text-indigo-600 transition-colors"
                      >
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                        <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      </button>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-gray-500 text-xs">{fmt(cat.amount)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          cat.amount > cat.budget ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>{cat.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((cat.amount / cat.budget) * 100, 100)}%`,
                          backgroundColor: cat.amount > cat.budget ? "#ef4444" : cat.color,
                        }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Budget: {fmt(cat.budget)}</span>
                      {cat.amount > cat.budget && (
                        <span className="text-red-500 font-semibold">Over by {fmt(cat.amount - cat.budget)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ChartEmptyState message="No category spending data yet" />
            )}
          </Card>

          <Card title="Top Expenses This Period" accentColor="#8b5cf6">
            {hasTopExpenses ? (
              <div className="space-y-3">
                {topExpenses.map((exp, i) => (
                  <div key={exp.vendor}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, #6366f1, #8b5cf6)` }}>
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{exp.vendor}</p>
                        <p className="text-xs text-gray-400">{exp.category} · {exp.frequency}x</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-gray-900 text-sm">{fmt(exp.amount)}</p>
                      <p className="text-[10px] text-gray-400">{fmt(exp.amount / exp.frequency)}/txn</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ChartEmptyState message="No expense data for this period" />
            )}
          </Card>
        </div>

        {/* Key Insights */}
        {insights && insights.length > 0 && (
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-sm overflow-hidden">
            <div className="h-1 w-full" style={{ background: "linear-gradient(to right,#6366f1,#8b5cf6,#a855f7)" }} />
            <div className="p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-3">Key Insights</h3>
                <ul className="space-y-2">
                  {insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-indigo-400 font-bold mt-0.5">•</span>
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

  // ── Tab: Custom Reports ────────────────────────────────────────────────────

  const renderCustomReportBuilder = () => (
    <div className="space-y-6">
      <Card title="Build Custom Report" subtitle="Configure and generate a tailored report" accentColor="#10b981">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Report Name</label>
            <input type="text" value={customConfig.name}
              onChange={(e) => setCustomConfig({ ...customConfig, name: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition"
              placeholder="My Custom Report" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Metrics</label>
            <div className="space-y-2">
              {["income", "expenses", "savings", "net-worth"].map((m) => (
                <label key={m} className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => {
                      const nm = customConfig.metrics.includes(m)
                        ? customConfig.metrics.filter(x => x !== m)
                        : [...customConfig.metrics, m];
                      setCustomConfig({ ...customConfig, metrics: nm });
                    }}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all ${
                      customConfig.metrics.includes(m)
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-200 bg-white"
                    }`}>
                    {customConfig.metrics.includes(m) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 capitalize">{m.replace("-", " ")}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chart Type</label>
              <select value={customConfig.chartType}
                onChange={(e) => setCustomConfig({ ...customConfig, chartType: e.target.value as ChartType })}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition">
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Group By</label>
              <select value={customConfig.groupBy}
                onChange={(e) => setCustomConfig({ ...customConfig, groupBy: e.target.value as any })}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition">
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="category">By Category</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date Range</label>
              <select value={customConfig.dateRange}
                onChange={(e) => setCustomConfig({ ...customConfig, dateRange: e.target.value as DateRange })}
                className="w-full rounded-xl border-2 border-gray-100 px-4 py-2.5 text-sm focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition">
                <option value="last-7-days">Last 7 Days</option>
                <option value="last-30-days">Last 30 Days</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          <button
            onClick={() => alert("Custom report generated!")}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:opacity-90 transition">
            <FileText className="w-4 h-4" /> Generate Report
          </button>
          <button
            onClick={() => setCustomConfig({ name: "My Custom Report", dateRange: "last-30-days", metrics: ["income", "expenses"], groupBy: "month", chartType: "line", includeCategories: [] })}
            className="rounded-xl border-2 border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition">
            Reset
          </button>
        </div>
      </Card>
    </div>
  );

  // ── Tab: Spending Trends ───────────────────────────────────────────────────

  const renderSpendingTrends = () => {
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
        <Card title="Spending Trends by Category" subtitle="How your categories have moved over time" accentColor="#f59e0b">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="food" stroke="#f97316" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="transport" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="shopping" stroke="#ec4899" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="bills" stroke="#10b981" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="📈 Increasing Trends" accentColor="#ef4444">
            <div className="space-y-3">
              {[{ name: "Food & Dining", pct: "+13.3%" }, { name: "Shopping", pct: "+13.3%" }].map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-red-50 rounded-2xl">
                  <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                  <span className="text-sm font-extrabold text-red-600">{item.pct}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="📉 Decreasing Trends" accentColor="#10b981">
            <div className="space-y-3">
              {[{ name: "Transportation", pct: "-5.0%" }].map(item => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-emerald-50 rounded-2xl">
                  <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                  <span className="text-sm font-extrabold text-emerald-600">{item.pct}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // ── Tab: Comparison ────────────────────────────────────────────────────────

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
        <Card title="Period Comparison" subtitle="This year vs last year spending" accentColor="#3b82f6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={comparisonData} barGap={4} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="current" fill="#6366f1" name="This Year" radius={[6, 6, 0, 0]} />
              <Bar dataKey="previous" fill="#e2e8f0" name="Last Year" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <IncomeExpenseComparison data={comparisonData.map(d => ({
          month: d.month, income: 5000, expenses: d.current, savings: 5000 - d.current,
        }))} />
      </div>
    );
  };

  // ── Tab: Forecast ──────────────────────────────────────────────────────────

  const renderForecast = () => {
    const forecastData = [
      { month: "Jul", actual: 3850, forecast: 3900 },
      { month: "Aug", actual: null, forecast: 3950 },
      { month: "Sep", actual: null, forecast: 4000 },
      { month: "Oct", actual: null, forecast: 4050 },
      { month: "Nov", actual: null, forecast: 4100 },
      { month: "Dec", actual: null, forecast: 4200 },
    ];

    return (
      <div className="space-y-6">
        <Card title="6-Month Spending Forecast" subtitle="Projected expenses based on historical patterns" accentColor="#a855f7">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => v ? fmt(v) : "—"} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} name="Actual"
                dot={{ r: 4, fill: "#10b981" }} connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#6366f1" strokeWidth={2.5}
                strokeDasharray="6 4" name="Forecast" dot={{ r: 4, fill: "#6366f1" }} connectNulls />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 flex items-start gap-3 bg-indigo-50 rounded-2xl px-4 py-3 border border-indigo-100">
            <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-indigo-700">
              Based on your historical patterns, expenses are projected to increase by approximately{" "}
              <strong>9%</strong> over the next 6 months. Consider adjusting your budgets accordingly.
            </p>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Projected Dec Total", value: "$4,200", icon: Target, bg: "bg-violet-50", text: "text-violet-600" },
            { label: "Expected Increase", value: "+9%", icon: TrendingUp, bg: "bg-orange-50", text: "text-orange-500" },
            { label: "Suggested Buffer", value: "$378", icon: Award, bg: "bg-emerald-50", text: "text-emerald-600" },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                <item.icon className={`w-5 h-5 ${item.text}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{item.label}</p>
                <p className={`text-xl font-extrabold mt-0.5 ${item.text}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Category Deep Dive Modal ───────────────────────────────────────────────

  const CategoryModal = () => {
    if (!selectedCategory || !categoryDetail) return null;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
            <div>
              <h2 className="text-lg font-bold text-white">{selectedCategory}</h2>
              <p className="text-indigo-200 text-xs mt-0.5">Detailed breakdown</p>
            </div>
            <button onClick={() => { setSelectedCategory(null); setCategoryDetail(null); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Spent", value: fmt(categoryDetail.total) },
                { label: "Transactions", value: String(categoryDetail.transactions) },
                { label: "Avg per Txn", value: fmt(categoryDetail.avgTransaction) },
                { label: "Trend", value: fmtPct(categoryDetail.trend), color: categoryDetail.trend < 0 ? "text-emerald-600" : "text-red-600" },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                  <p className={`text-xl font-extrabold ${item.color ?? "text-gray-900"}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <Card title="Spending Over Time" accentColor="#6366f1">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryDetail.breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Top Merchants" accentColor="#f97316">
              <div className="space-y-2">
                {categoryDetail.topMerchants.map((m, i) => (
                  <div key={m.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-400">{m.count} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-gray-900">{fmt(m.amount)}</p>
                      <p className="text-[10px] text-gray-400">{fmt(m.amount / m.count)}/avg</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ── Auth loading ───────────────────────────────────────────────────────────

  if (isCheckingAuth || !isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const TABS = [
    { id: "overview",    label: "Overview",         icon: BarChart3 },
    { id: "custom",      label: "Custom Reports",   icon: Settings },
    { id: "trends",      label: "Spending Trends",  icon: TrendingUp },
    { id: "comparison",  label: "Comparison",       icon: PieChartIcon },
    { id: "forecast",    label: "Forecast",         icon: Target },
  ] as const;

  return (
    <>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
        .tab-content { animation: fadeIn 0.3s ease both; }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-7">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Analytics</span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Financial Reports
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Comprehensive analysis and insights into your financial health.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 border border-gray-100 shadow-sm">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="text-sm font-semibold text-gray-700 bg-transparent outline-none cursor-pointer">
                  <option value="last-7-days">Last 7 Days</option>
                  <option value="last-30-days">Last 30 Days</option>
                  <option value="last-3-months">Last 3 Months</option>
                  <option value="last-6-months">Last 6 Months</option>
                  <option value="last-year">Last Year</option>
                </select>
              </div>
              <button onClick={handleExport} disabled={isExporting}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60">
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </button>
            </div>
          </div>

          {/* ── Tabs ────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.id}
                onClick={() => setSelectedReport(tab.id as ReportTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedReport === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-slate-50"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Content ─────────────────────────────────────────────────────── */}
          <div className="tab-content" key={selectedReport}>
            {selectedReport === "overview"   && renderOverview()}
            {selectedReport === "custom"     && renderCustomReportBuilder()}
            {selectedReport === "trends"     && renderSpendingTrends()}
            {selectedReport === "comparison" && renderComparison()}
            {selectedReport === "forecast"   && renderForecast()}
          </div>
        </div>
      </div>

      <CategoryModal />
    </>
  );
};

export default EnhancedFinancialReports;
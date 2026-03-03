"use client";

import { useState, useEffect } from "react";
import {
  Brain, Loader2, Sparkles, AlertTriangle, CheckCircle, Info,
  Lightbulb, TrendingUp, ArrowRight, X, ChevronDown, Filter,
  RefreshCw, AlertCircle,
} from "lucide-react";
import { transactionsAPI, type Transaction as ApiTransaction } from "@/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SpendingInsight {
  id: string;
  type: "warning" | "success" | "info" | "tip";
  title: string;
  message: string;
  impact: "high" | "medium" | "low";
  category?: string;
  amount?: number;
  actionable: boolean;
  actions?: string[];
  priority: number;
}

// ── Insight generator ─────────────────────────────────────────────────────────

function generateAIInsights(transactions: ApiTransaction[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  if (transactions.length === 0) return insights;

  const expenses = transactions.filter((t) => t.type === "expense" || (t.amount && t.amount > 0));

  // Top spending category
  const byCategory: Record<string, number> = {};
  expenses.forEach((t) => { byCategory[t.category] = (byCategory[t.category] ?? 0) + Math.abs(t.amount); });
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const [topCat, topAmt] = sorted[0];
    const total = expenses.reduce((s, t) => s + Math.abs(t.amount), 0);
    const pct = (topAmt / total) * 100;
    if (pct > 30) {
      insights.push({
        id: "top-category", type: "info", priority: 2,
        title: `${topCat} is Your Largest Expense`,
        message: `${topCat} accounts for ${pct.toFixed(0)}% of your spending ($${topAmt.toFixed(2)}).`,
        impact: "medium", category: topCat, amount: topAmt, actionable: true,
        actions: ["Review category spending", "Find savings opportunities", "Set a budget alert"],
      });
    }
  }

  // Impulse buying
  const small = expenses.filter((t) => Math.abs(t.amount) < 50);
  if (small.length > 5) {
    const tot = small.reduce((s, t) => s + Math.abs(t.amount), 0);
    insights.push({
      id: "impulse", type: "warning", priority: 1,
      title: "Potential Impulse Purchases",
      message: `Detected ${small.length} small transactions totalling $${tot.toFixed(2)}. These add up quickly!`,
      impact: "medium", amount: tot, actionable: true,
      actions: ["Review small purchases", "Set a spending rule", "Apply the 24-hour rule"],
    });
  }

  // Subscriptions
  const subs = transactions.filter((t) => {
    const d = t.description?.toLowerCase() ?? "";
    return ["subscription", "monthly", "netflix", "spotify", "disney", "hulu"].some((k) => d.includes(k));
  });
  if (subs.length > 0) {
    const tot = subs.reduce((s, t) => s + Math.abs(t.amount), 0);
    insights.push({
      id: "subscriptions", type: "tip", priority: 2,
      title: "Time for a Subscription Audit",
      message: `You have ${subs.length} subscriptions costing $${tot.toFixed(2)}/month. Any unused ones?`,
      impact: "medium", amount: tot, actionable: true,
      actions: ["List all subscriptions", "Cancel unused services", "Negotiate better rates"],
    });
  }

  // Weekend spending
  let weekend = 0, weekday = 0;
  expenses.forEach((t) => {
    const d = new Date(t.date).getDay();
    (d === 0 || d === 6) ? (weekend += Math.abs(t.amount)) : (weekday += Math.abs(t.amount));
  });
  const wkPct = weekend + weekday > 0 ? (weekend / (weekend + weekday)) * 100 : 0;
  if (wkPct > 40) {
    insights.push({
      id: "weekend", type: "tip", priority: 3,
      title: "Weekend Spending Pattern",
      message: `${wkPct.toFixed(0)}% of your spending happens on weekends ($${weekend.toFixed(2)}).`,
      impact: "low", amount: weekend, actionable: true,
      actions: ["Plan a weekend budget", "Try free activities", "Meal prep at home"],
    });
  }

  // Best day
  const byDay: Record<number, number[]> = {};
  expenses.forEach((t) => {
    const d = new Date(t.date).getDay();
    (byDay[d] = byDay[d] ?? []).push(Math.abs(t.amount));
  });
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let bestDay = "", lowest = Infinity;
  Object.entries(byDay).forEach(([d, amts]) => {
    const avg = amts.reduce((a, b) => a + b, 0) / amts.length;
    if (avg < lowest) { lowest = avg; bestDay = DAYS[+d]; }
  });
  if (bestDay) {
    insights.push({
      id: "best-day", type: "success", priority: 5,
      title: "Your Best Spending Day",
      message: `${bestDay} is your most controlled day with an average of $${lowest.toFixed(2)}.`,
      impact: "low", actionable: false,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// ── Design maps ───────────────────────────────────────────────────────────────

const TYPE_STYLES = {
  warning: { bg: "bg-red-50",     border: "border-red-100",    iconBg: "bg-red-100",     iconText: "text-red-500",     label: "Warning",  labelBg: "bg-red-100 text-red-700" },
  success: { bg: "bg-emerald-50", border: "border-emerald-100",iconBg: "bg-emerald-100", iconText: "text-emerald-600", label: "Win",      labelBg: "bg-emerald-100 text-emerald-700" },
  info:    { bg: "bg-indigo-50",  border: "border-indigo-100", iconBg: "bg-indigo-100",  iconText: "text-indigo-600",  label: "Info",     labelBg: "bg-indigo-100 text-indigo-700" },
  tip:     { bg: "bg-amber-50",   border: "border-amber-100",  iconBg: "bg-amber-100",   iconText: "text-amber-600",   label: "Tip",      labelBg: "bg-amber-100 text-amber-700" },
};

const IMPACT_STYLES = {
  high:   "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low:    "bg-slate-100 text-slate-600",
};

const TYPE_ICONS = {
  warning: AlertTriangle,
  success: CheckCircle,
  info:    Info,
  tip:     Lightbulb,
};

const FILTER_OPTIONS = [
  { value: "all",     label: "All" },
  { value: "warning", label: "Warnings" },
  { value: "success", label: "Wins" },
  { value: "info",    label: "Info" },
  { value: "tip",     label: "Tips" },
] as const;

// ── Dashboard component ───────────────────────────────────────────────────────

function AIInsightsDashboard({ transactions }: { transactions: ApiTransaction[] }) {
  const [insights] = useState(() => generateAIInsights(transactions));
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "warning" | "success" | "info" | "tip">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = insights.filter(
    (i) => !dismissed.has(i.id) && (filter === "all" || i.type === filter)
  );

  const counts = {
    warning: insights.filter((i) => i.type === "warning" && !dismissed.has(i.id)).length,
    success: insights.filter((i) => i.type === "success" && !dismissed.has(i.id)).length,
    info:    insights.filter((i) => i.type === "info"    && !dismissed.has(i.id)).length,
    tip:     insights.filter((i) => i.type === "tip"     && !dismissed.has(i.id)).length,
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No Insights Yet</h3>
        <p className="text-sm text-gray-400">Add more transactions to get personalised AI-powered insights about your spending habits.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Summary strip ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right,#6366f1,#8b5cf6,#a855f7)" }} />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">AI Analysis</p>
              <p className="text-xl font-extrabold text-gray-900 leading-tight">
                {filtered.length} insight{filtered.length !== 1 ? "s" : ""} found
              </p>
              <p className="text-xs text-gray-400">Based on {transactions.length} transactions</p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {counts.warning > 0 && (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-bold text-red-700">{counts.warning} warning{counts.warning > 1 ? "s" : ""}</span>
              </div>
            )}
            {counts.tip > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-2xl px-3 py-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-amber-700">{counts.tip} tip{counts.tip > 1 ? "s" : ""}</span>
              </div>
            )}
            {counts.success > 0 && (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">{counts.success} win{counts.success > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Filter pills ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
        {FILTER_OPTIONS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-slate-50"
            }`}>
            <Filter className="w-3.5 h-3.5" />
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Insight cards ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {filtered.map((insight) => {
          const st = TYPE_STYLES[insight.type];
          const Icon = TYPE_ICONS[insight.type];
          const isExpanded = expanded === insight.id;

          return (
            <div key={insight.id}
              className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md ${
                insight.type === "warning" ? "border-red-100" :
                insight.type === "success" ? "border-emerald-100" :
                insight.type === "info"    ? "border-indigo-100" :
                                             "border-amber-100"
              }`}>
              {/* Type accent bar */}
              <div className={`h-1 w-full ${
                insight.type === "warning" ? "bg-red-400" :
                insight.type === "success" ? "bg-emerald-500" :
                insight.type === "info"    ? "bg-indigo-500" :
                                             "bg-amber-400"
              }`} />

              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Icon badge */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${st.iconBg}`}>
                    <Icon className={`w-5 h-5 ${st.iconText}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900">{insight.title}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${st.labelBg}`}>
                          {st.label}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${IMPACT_STYLES[insight.impact]}`}>
                          {insight.impact} impact
                        </span>
                      </div>
                      <button onClick={() => setDismissed((p) => new Set([...p, insight.id]))}
                        className="p-1.5 rounded-xl text-gray-300 hover:text-gray-500 hover:bg-slate-100 transition flex-shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-500 leading-relaxed">{insight.message}</p>

                    {/* Category + amount pills */}
                    {(insight.category || insight.amount) && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {insight.category && (
                          <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-gray-600">
                            {insight.category}
                          </span>
                        )}
                        {insight.amount && (
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${st.labelBg}`}>
                            ${insight.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions toggle */}
                    {insight.actionable && insight.actions && (
                      <div className="mt-4">
                        <button
                          onClick={() => setExpanded(isExpanded ? null : insight.id)}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                            isExpanded ? "bg-slate-100 text-gray-600" : `${st.labelBg}`
                          }`}>
                          View Actions
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        </button>

                        {isExpanded && (
                          <div className="mt-3 space-y-2">
                            {insight.actions.map((action, i) => (
                              <div key={i}
                                className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 rounded-2xl border border-gray-100 text-sm font-semibold text-gray-700 hover:bg-slate-100 transition cursor-pointer">
                                <ArrowRight className={`w-3.5 h-3.5 flex-shrink-0 ${st.iconText}`} />
                                {action}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty filtered state */}
      {filtered.length === 0 && insights.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">No {filter} insights found.</p>
          <button onClick={() => setFilter("all")}
            className="mt-3 text-xs font-bold text-indigo-500 hover:underline">Clear filter</button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { void loadTransactions(); }, []);

  async function loadTransactions() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await transactionsAPI.getAll();
      if (!Array.isArray(data)) throw new Error("Invalid response format");
      setTransactions(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400 font-medium">Analysing your spending…</p>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Couldn't Load Insights</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={loadTransactions}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">AI Powered</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Spending Insights</h1>
            <p className="text-gray-400 text-sm mt-1">Smart analysis of your spending patterns and behaviour.</p>
          </div>
          <button onClick={loadTransactions}
            className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-100 shadow-sm px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-slate-50 hover:shadow-md transition-all self-start">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">{error}</p>
          </div>
        )}

        <AIInsightsDashboard transactions={transactions} />
      </div>
    </div>
  );
}
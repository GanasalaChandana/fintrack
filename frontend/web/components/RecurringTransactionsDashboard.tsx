"use client";

import { useState, useEffect } from "react";
import {
  RefreshCw, Calendar, DollarSign, TrendingUp, Check,
  Eye, Plus, Trash2, ChevronDown, ChevronUp, Clock,
} from "lucide-react";
import {
  detectRecurringTransactions,
  createRecurringRule,
  type Transaction,
  type RecurringTransaction,
} from "@/lib/utils/recurringDetector";

// ── Props ─────────────────────────────────────────────────────────────────────

interface RecurringTransactionsDashboardProps {
  transactions: Transaction[];
  onCreateRule?: (rule: any) => void;
  onDeleteRecurring?: (id: string) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(v);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const FREQ_STYLES: Record<string, { accentBar: string; iconBg: string; iconText: string; pillBg: string; pillText: string }> = {
  weekly:    { accentBar: "bg-indigo-500",  iconBg: "bg-indigo-50",  iconText: "text-indigo-600",  pillBg: "bg-indigo-50",  pillText: "text-indigo-700" },
  biweekly:  { accentBar: "bg-violet-500",  iconBg: "bg-violet-50",  iconText: "text-violet-600",  pillBg: "bg-violet-50",  pillText: "text-violet-700" },
  monthly:   { accentBar: "bg-emerald-500", iconBg: "bg-emerald-50", iconText: "text-emerald-600", pillBg: "bg-emerald-50", pillText: "text-emerald-700" },
  quarterly: { accentBar: "bg-amber-400",   iconBg: "bg-amber-50",   iconText: "text-amber-600",   pillBg: "bg-amber-50",   pillText: "text-amber-700" },
  yearly:    { accentBar: "bg-amber-400",   iconBg: "bg-amber-50",   iconText: "text-amber-600",   pillBg: "bg-amber-50",   pillText: "text-amber-700" },
};

const FREQ_LABELS: Record<string, string> = {
  weekly: "Weekly", biweekly: "Biweekly", monthly: "Monthly",
  quarterly: "Quarterly", yearly: "Yearly",
};

function toMonthly(amount: number, frequency: string) {
  switch (frequency) {
    case "weekly":    return amount * 4.33;
    case "biweekly":  return amount * 2.17;
    case "quarterly": return amount / 3;
    case "yearly":    return amount / 12;
    default:          return amount;
  }
}

const FILTER_OPTIONS = [
  { value: "all",      label: "All" },
  { value: "weekly",   label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly",  label: "Monthly" },
  { value: "yearly",   label: "Yearly" },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function RecurringTransactionsDashboard({
  transactions,
  onCreateRule,
  onDeleteRecurring,
}: RecurringTransactionsDashboardProps) {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly">("all");

  useEffect(() => {
    if (transactions.length === 0) { setIsLoading(false); return; }
    setIsLoading(true);
    setTimeout(() => {
      const detected = detectRecurringTransactions(transactions, 2, 0.5);
      setRecurring(detected);
      setIsLoading(false);
    }, 500);
  }, [transactions]);

  const filtered = filter === "all"
    ? recurring
    : recurring.filter((r) => r.pattern.frequency === filter);

  const monthlyTotal = recurring
    .filter((r) => r.pattern.type === "EXPENSE")
    .reduce((s, r) => s + toMonthly(r.pattern.amount, r.pattern.frequency), 0);

  const potentialSavingsTotal = recurring.reduce((s, r) => s + (r.savings ?? 0), 0);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-14 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-gray-800 mb-1">Analysing Transactions…</h3>
        <p className="text-sm text-gray-400">
          Detecting recurring patterns in {transactions.length} transactions
        </p>
      </div>
    );
  }

  // ── Empty ──────────────────────────────────────────────────────────────────

  if (recurring.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-1 w-full" style={{ background: "linear-gradient(to right,#6366f1,#8b5cf6)" }} />
        <div className="p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-2">No Recurring Transactions Found</h3>
          <p className="text-sm text-gray-400 mb-5">
            Analysed {transactions.length} transactions but no recurring patterns detected yet.
          </p>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 text-left max-w-sm mx-auto">
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">Tips for Detection</p>
            <ul className="space-y-1 text-xs text-indigo-700">
              <li className="flex items-start gap-2"><span>•</span>Add at least 3 similar transactions</li>
              <li className="flex items-start gap-2"><span>•</span>Transactions should occur regularly (weekly, monthly…)</li>
              <li className="flex items-start gap-2"><span>•</span>Amounts should be relatively consistent</li>
              <li className="flex items-start gap-2"><span>•</span>Descriptions should be similar</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Recurring Transactions", sub: "Detected patterns",
            value: String(recurring.length),
            icon: RefreshCw, iconBg: "bg-indigo-50", iconText: "text-indigo-600", valueCls: "text-gray-900",
          },
          {
            label: "Monthly Recurring", sub: "Total expenses",
            value: fmt(monthlyTotal),
            icon: DollarSign, iconBg: "bg-violet-50", iconText: "text-violet-600", valueCls: "text-gray-900",
          },
          {
            label: "Potential Savings", sub: "Annual estimate",
            value: fmt(potentialSavingsTotal),
            icon: TrendingUp, iconBg: "bg-emerald-50", iconText: "text-emerald-600", valueCls: "text-emerald-600",
          },
        ].map((card) => (
          <div key={card.label}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              <card.icon className={`w-5 h-5 ${card.iconText}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider leading-tight">{card.label}</p>
              <p className="text-xs text-gray-400">{card.sub}</p>
              <p className={`text-2xl font-extrabold tracking-tight mt-0.5 ${card.valueCls}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tab bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
        {FILTER_OPTIONS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              filter === f.value
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 hover:bg-slate-50"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Recurring list */}
      <div className="space-y-4">
        {filtered.map((item) => {
          const freq = item.pattern.frequency;
          const st = FREQ_STYLES[freq] ?? FREQ_STYLES.monthly;
          const isExpanded = expandedId === item.id;
          const confidencePct = Math.round(item.confidence * 100);

          return (
            <div key={item.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

              {/* Accent bar */}
              <div className={`h-1 w-full ${st.accentBar}`} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${st.iconBg}`}>
                      <RefreshCw className={`w-5 h-5 ${st.iconText}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900">{item.pattern.description}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${st.pillBg} ${st.pillText}`}>
                          {FREQ_LABELS[freq] ?? freq}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.pattern.category} · {item.transactions.length} occurrence{item.transactions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-extrabold text-gray-900">{fmt(item.pattern.amount)}</p>
                    <p className={`text-xs font-bold mt-0.5 ${
                      confidencePct >= 80 ? "text-emerald-600" :
                      confidencePct >= 60 ? "text-amber-500" : "text-gray-400"
                    }`}>{confidencePct}% confidence</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-5 flex-wrap mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Next: <span className="font-semibold text-gray-700">
                      {new Date(item.nextExpectedDate).toLocaleDateString("en-US", {
                        month: "numeric", day: "numeric", year: "numeric",
                      })}
                    </span></span>
                  </div>

                  {item.pattern.dayOfWeek !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-semibold text-gray-700">{DAYS[item.pattern.dayOfWeek]}</span>
                    </div>
                  )}

                  {item.pattern.dayOfMonth !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-semibold text-gray-700">Day {item.pattern.dayOfMonth}</span>
                    </div>
                  )}

                  {item.savings != null && item.savings > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {fmt(item.savings)}/year potential
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-gray-100 text-xs font-bold text-gray-600 hover:bg-slate-50 hover:border-gray-200 transition-all">
                    <Eye className="w-3.5 h-3.5" />
                    View History
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {onCreateRule && (
                    <button
                      onClick={() => onCreateRule(createRecurringRule(item))}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 hover:-translate-y-0.5 transition-all">
                      <Plus className="w-3.5 h-3.5" />
                      Create Rule
                    </button>
                  )}

                  {onDeleteRecurring && (
                    <button
                      onClick={() => onDeleteRecurring(item.id)}
                      className="p-2 rounded-xl border-2 border-gray-100 text-gray-300 hover:text-red-400 hover:border-red-100 hover:bg-red-50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* History expand */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Transaction History
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {item.transactions.map((txn) => (
                        <div key={txn.id}
                          className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-2xl text-sm">
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-gray-600">
                              {new Date(txn.date).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">{fmt(txn.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty filtered */}
        {filtered.length === 0 && recurring.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <RefreshCw className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No {filter} recurring transactions found.</p>
            <button onClick={() => setFilter("all")}
              className="mt-2 text-xs font-bold text-indigo-500 hover:underline">
              View all
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
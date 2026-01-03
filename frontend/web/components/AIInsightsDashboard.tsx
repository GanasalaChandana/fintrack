// WORKING DEMO VERSION - No API needed!
// Copy this to test insights immediately

"use client";

import { useState } from "react";
import { 
  Brain, Sparkles, AlertTriangle, CheckCircle, Info, Lightbulb, 
  TrendingUp, ArrowRight, X, ChevronDown, Filter, RefreshCw 
} from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: string;
}

interface SpendingInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  message: string;
  impact: 'high' | 'medium' | 'low';
  category?: string;
  amount?: number;
  actionable: boolean;
  actions?: string[];
  priority: number;
}

// Your CSV data converted to transactions
const SAMPLE_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2025-12-01', amount: 5000, category: 'Salary', description: 'Monthly Salary', type: 'INCOME' },
  { id: '2', date: '2025-12-01', amount: 1200, category: 'Housing', description: 'Rent Payment', type: 'EXPENSE' },
  { id: '3', date: '2025-12-02', amount: 15.99, category: 'Entertainment', description: 'Netflix Subscription', type: 'EXPENSE' },
  { id: '4', date: '2025-12-03', amount: 12.50, category: 'Food & Dining', description: 'Starbucks Coffee', type: 'EXPENSE' },
  { id: '5', date: '2025-12-03', amount: 45.30, category: 'Food & Dining', description: 'Grocery Shopping', type: 'EXPENSE' },
  { id: '6', date: '2025-12-05', amount: 9.99, category: 'Entertainment', description: 'Spotify Subscription', type: 'EXPENSE' },
  { id: '7', date: '2025-12-05', amount: 132.00, category: 'Bills & Utilities', description: 'Electric Bill', type: 'EXPENSE' },
  { id: '8', date: '2025-12-06', amount: 8.50, category: 'Food & Dining', description: 'Coffee', type: 'EXPENSE' },
  { id: '9', date: '2025-12-07', amount: 65.00, category: 'Transportation', description: 'Gas Station', type: 'EXPENSE' },
  { id: '10', date: '2025-12-08', amount: 29.99, category: 'Health & Fitness', description: 'Gym Membership', type: 'EXPENSE' },
  { id: '11', date: '2025-12-09', amount: 150.00, category: 'Shopping', description: 'Clothing Purchase', type: 'EXPENSE' },
  { id: '12', date: '2025-12-10', amount: 13.20, category: 'Food & Dining', description: 'Starbucks Coffee', type: 'EXPENSE' },
  { id: '13', date: '2025-12-11', amount: 52.40, category: 'Food & Dining', description: 'Grocery Shopping', type: 'EXPENSE' },
  { id: '14', date: '2025-12-12', amount: 18.50, category: 'Food & Dining', description: 'Lunch', type: 'EXPENSE' },
  { id: '15', date: '2025-12-13', amount: 500.00, category: 'Savings', description: 'Emergency Fund Transfer', type: 'EXPENSE' },
  { id: '16', date: '2025-12-14', amount: 85.00, category: 'Bills & Utilities', description: 'Internet Bill', type: 'EXPENSE' },
  { id: '17', date: '2025-12-15', amount: 42.00, category: 'Food & Dining', description: 'Dinner Out', type: 'EXPENSE' },
  { id: '18', date: '2025-12-16', amount: 11.99, category: 'Entertainment', description: 'Disney+ Subscription', type: 'EXPENSE' },
  { id: '19', date: '2025-12-17', amount: 7.50, category: 'Food & Dining', description: 'Coffee', type: 'EXPENSE' },
  { id: '20', date: '2025-12-18', amount: 48.90, category: 'Food & Dining', description: 'Grocery Shopping', type: 'EXPENSE' },
  { id: '21', date: '2025-12-19', amount: 200.00, category: 'Healthcare', description: 'Doctor Visit', type: 'EXPENSE' },
  { id: '22', date: '2025-12-20', amount: 35.00, category: 'Transportation', description: 'Uber Ride', type: 'EXPENSE' },
  { id: '23', date: '2025-12-21', amount: 99.00, category: 'Shopping', description: 'Amazon Purchase', type: 'EXPENSE' },
  { id: '24', date: '2025-12-22', amount: 24.50, category: 'Food & Dining', description: 'Coffee & Snack', type: 'EXPENSE' },
  { id: '25', date: '2025-12-23', amount: 60.00, category: 'Entertainment', description: 'Movie Night', type: 'EXPENSE' },
  { id: '26', date: '2025-12-24', amount: 175.00, category: 'Food & Dining', description: 'Holiday Dinner', type: 'EXPENSE' },
  { id: '27', date: '2025-12-25', amount: 450.00, category: 'Shopping', description: 'Holiday Gifts', type: 'EXPENSE' },
];

// Generate insights
function generateInsights(transactions: Transaction[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];
  
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  if (expenses.length === 0) return insights;

  // Top category
  const byCategory: Record<string, number> = {};
  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
  
  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const [topCat, topAmount] = sortedCats[0];
  const total = expenses.reduce((sum, t) => sum + t.amount, 0);
  const pct = (topAmount / total) * 100;

  if (pct > 30) {
    insights.push({
      id: 'top-cat',
      type: 'info',
      title: `${topCat} is Your Top Expense`,
      message: `${topCat} accounts for ${pct.toFixed(0)}% of spending ($${topAmount.toFixed(2)})`,
      impact: 'medium',
      category: topCat,
      amount: topAmount,
      actionable: true,
      actions: ['Review category spending', 'Find savings opportunities', 'Set budget alert'],
      priority: 2,
    });
  }

  // Small purchases
  const small = expenses.filter(t => t.amount < 50);
  const smallTotal = small.reduce((sum, t) => sum + t.amount, 0);
  
  if (small.length > 5) {
    insights.push({
      id: 'small',
      type: 'warning',
      title: 'Potential Impulse Purchases',
      message: `Detected ${small.length} small transactions totaling $${smallTotal.toFixed(2)}. These add up quickly!`,
      impact: 'medium',
      amount: smallTotal,
      actionable: true,
      actions: ['Review small purchases', 'Set spending rules', 'Use 24-hour rule'],
      priority: 1,
    });
  }

  // Subscriptions
  const subs = transactions.filter(t => {
    const desc = t.description.toLowerCase();
    return desc.includes('subscription') || 
           desc.includes('netflix') ||
           desc.includes('spotify') ||
           desc.includes('disney');
  });
  
  if (subs.length > 0) {
    const subsTotal = subs.reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      id: 'subs',
      type: 'tip',
      title: 'Subscription Audit Time',
      message: `You have ${subs.length} subscriptions costing $${subsTotal.toFixed(2)}/month`,
      impact: 'medium',
      amount: subsTotal,
      actionable: true,
      actions: ['List all subscriptions', 'Cancel unused services', 'Negotiate better rates'],
      priority: 2,
    });
  }

  // Weekend spending
  let weekend = 0, weekday = 0;
  expenses.forEach(t => {
    const day = new Date(t.date).getDay();
    (day === 0 || day === 6) ? weekend += t.amount : weekday += t.amount;
  });
  
  const weekendPct = (weekend / (weekend + weekday)) * 100;
  
  if (weekendPct > 40) {
    insights.push({
      id: 'weekend',
      type: 'tip',
      title: 'Weekend Spending Pattern',
      message: `${weekendPct.toFixed(0)}% of spending happens on weekends ($${weekend.toFixed(2)})`,
      impact: 'low',
      amount: weekend,
      actionable: true,
      actions: ['Plan weekend budget', 'Try free activities', 'Prepare meals at home'],
      priority: 3,
    });
  }

  // Best day
  const byDay: Record<number, number[]> = {};
  expenses.forEach(t => {
    const day = new Date(t.date).getDay();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(t.amount);
  });
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let bestDay = '';
  let lowest = Infinity;
  
  Object.entries(byDay).forEach(([d, amounts]) => {
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    if (avg < lowest) {
      lowest = avg;
      bestDay = days[parseInt(d)];
    }
  });

  if (bestDay) {
    insights.push({
      id: 'best',
      type: 'success',
      title: 'Your Best Spending Day',
      message: `${bestDay} is your most controlled spending day with an average of $${lowest.toFixed(2)}`,
      impact: 'low',
      actionable: false,
      priority: 5,
    });
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// Dashboard
function Dashboard({ transactions }: { transactions: Transaction[] }) {
  const [insights] = useState(() => generateInsights(transactions));
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'warning' | 'success' | 'info' | 'tip'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = insights.filter(i => 
    !dismissed.has(i.id) && (filter === 'all' || i.type === filter)
  );

  const getIcon = (type: string) => {
    const icons: Record<string, any> = {
      warning: AlertTriangle,
      success: CheckCircle,
      info: Info,
      tip: Lightbulb
    };
    const Icon = icons[type];
    return <Icon className="w-5 h-5" />;
  };

  const getColors = (type: string) => {
    const c: Record<string, any> = {
      warning: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: 'text-red-600' },
      success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: 'text-green-600' },
      info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: 'text-blue-600' },
      tip: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900', icon: 'text-yellow-600' }
    };
    return c[type];
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Insights Yet</h3>
        <p className="text-gray-600">Add more transactions to get personalized insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
        </div>
        <p className="text-purple-100">Personalized spending recommendations</p>
        <div className="mt-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">{filtered.length} insights from {transactions.length} transactions</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-gray-500" />
        {(['all', 'warning', 'success', 'info', 'tip'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(insight => {
          const colors = getColors(insight.type);
          const impactColors: Record<string, string> = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-gray-100 text-gray-800'
          };
          
          return (
            <div key={insight.id} className={`border rounded-xl ${colors.bg} ${colors.border} ${colors.text}`}>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-white ${colors.icon}`}>
                    {getIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-lg">{insight.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${impactColors[insight.impact]}`}>
                            {insight.impact.toUpperCase()} IMPACT
                          </span>
                        </div>
                        <p className="text-sm opacity-90">{insight.message}</p>
                      </div>
                      <button
                        onClick={() => setDismissed(new Set([...dismissed, insight.id]))}
                        className="p-1 hover:bg-white/20 rounded ml-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {(insight.category || insight.amount) && (
                      <div className="flex items-center gap-4 text-sm mt-2">
                        {insight.category && (
                          <span className="px-2 py-1 bg-white rounded-full font-medium">{insight.category}</span>
                        )}
                        {insight.amount && <span className="font-bold">${insight.amount.toFixed(2)}</span>}
                      </div>
                    )}

                    {insight.actionable && insight.actions && (
                      <div className="mt-3">
                        <button
                          onClick={() => setExpanded(expanded === insight.id ? null : insight.id)}
                          className="flex items-center gap-2 text-sm font-semibold hover:underline"
                        >
                          View Actions
                          <ChevronDown className={`w-4 h-4 transition ${expanded === insight.id ? 'rotate-180' : ''}`} />
                        </button>
                        {expanded === insight.id && (
                          <div className="mt-3 space-y-2">
                            {insight.actions.map((a, i) => (
                              <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg text-sm font-medium">
                                <ArrowRight className="w-4 h-4" />
                                {a}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main
export default function InsightsPage() {
  const [transactions] = useState(SAMPLE_TRANSACTIONS);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">AI-Powered Insights</h1>
                <p className="text-gray-600">Smart spending analysis</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800 font-semibold mb-1">
            <Info className="w-5 h-5" />
            Demo Mode - No API Required
          </div>
          <p className="text-blue-700 text-sm">
            Showing {transactions.length} sample transactions with AI-powered insights. 
            This works without any backend!
          </p>
        </div>
        <Dashboard transactions={transactions} />
      </main>
    </div>
  );
}
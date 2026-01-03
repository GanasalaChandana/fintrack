"use client";

import { useState, useEffect } from "react";
import { 
  Brain, Loader2, Sparkles, AlertTriangle, CheckCircle, Info, Lightbulb, 
  TrendingUp, ArrowRight, X, ChevronDown, Filter 
} from "lucide-react";

// Import your actual API
import { transactionsAPI, type Transaction as ApiTransaction } from "@/lib/api";

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

// Generate insights from transactions
function generateAIInsights(transactions: ApiTransaction[]): SpendingInsight[] {
  const insights: SpendingInsight[] = [];

  if (transactions.length === 0) return insights;

  // 1. Top spending category
  const byCategory = transactions.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = 0;
    acc[t.category] += Math.abs(t.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const total = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const percentage = (topCategory[1] / total) * 100;

  if (percentage > 30) {
    insights.push({
      id: 'top-category',
      type: 'info',
      title: `${topCategory[0]} is Your Largest Expense`,
      message: `${topCategory[0]} accounts for ${percentage.toFixed(0)}% of your spending ($${topCategory[1].toFixed(2)}).`,
      impact: 'medium',
      category: topCategory[0],
      amount: topCategory[1],
      actionable: true,
      actions: ['Review category spending', 'Find savings opportunities', 'Set budget alert'],
      priority: 2,
    });
  }

  // 2. Small transactions (impulse buying)
  const smallTransactions = transactions.filter(t => Math.abs(t.amount) < 50);
  if (smallTransactions.length > 5) {
    const totalSmall = smallTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    insights.push({
      id: 'impulse-buying',
      type: 'warning',
      title: 'Potential Impulse Purchases',
      message: `Detected ${smallTransactions.length} small transactions totaling $${totalSmall.toFixed(2)}. These add up quickly!`,
      impact: 'medium',
      amount: totalSmall,
      actionable: true,
      actions: ['Review small purchases', 'Set spending rules', 'Use 24-hour rule for purchases'],
      priority: 1,
    });
  }

  // 3. Weekend spending
  let weekendTotal = 0;
  let weekdayTotal = 0;
  transactions.forEach(t => {
    const day = new Date(t.date).getDay();
    if (day === 0 || day === 6) {
      weekendTotal += Math.abs(t.amount);
    } else {
      weekdayTotal += Math.abs(t.amount);
    }
  });

  const weekendPercentage = (weekendTotal / (weekendTotal + weekdayTotal)) * 100;
  if (weekendPercentage > 60) {
    insights.push({
      id: 'weekend-spending',
      type: 'tip',
      title: 'Weekend Spending Pattern',
      message: `${weekendPercentage.toFixed(0)}% of your spending happens on weekends. Consider planning activities or meal prepping.`,
      impact: 'low',
      actionable: true,
      actions: ['Plan weekend budget', 'Try free activities', 'Prepare meals at home'],
      priority: 3,
    });
  }

  // 4. Subscription detection
  const subscriptions = transactions.filter(t => 
    t.description.toLowerCase().includes('subscription') || 
    t.description.toLowerCase().includes('monthly') ||
    t.description.toLowerCase().includes('netflix') ||
    t.description.toLowerCase().includes('spotify')
  );

  if (subscriptions.length > 0) {
    const totalSubs = subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    insights.push({
      id: 'subscription-audit',
      type: 'tip',
      title: 'Time for Subscription Audit',
      message: `You have ${subscriptions.length} subscriptions costing $${totalSubs.toFixed(2)}/month. Review for unused services.`,
      impact: 'medium',
      amount: totalSubs,
      actionable: true,
      actions: ['List all subscriptions', 'Cancel unused services', 'Negotiate better rates'],
      priority: 2,
    });
  }

  // 5. Average transaction size
  const avgTransaction = total / transactions.length;
  insights.push({
    id: 'avg-transaction',
    type: 'info',
    title: 'Average Transaction Insight',
    message: `Your average transaction is $${avgTransaction.toFixed(2)}. This helps track your typical spending.`,
    impact: 'low',
    actionable: false,
    priority: 4,
  });

  // 6. Good spending day
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDay: Record<number, number[]> = {};
  transactions.forEach(t => {
    const day = new Date(t.date).getDay();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(Math.abs(t.amount));
  });

  if (Object.keys(byDay).length > 0) {
    let bestDayData: { day: string; average: number } = { day: '', average: Infinity };
    let lowestAvg = Infinity;
    
    Object.entries(byDay).forEach(([dayNum, amounts]) => {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      if (avg < lowestAvg) {
        lowestAvg = avg;
        bestDayData = { day: days[parseInt(dayNum)], average: avg };
      }
    });

    if (bestDayData.day) {
      insights.push({
        id: 'best-day',
        type: 'success',
        title: 'Your Best Spending Day',
        message: `${bestDayData.day} is your most controlled spending day with an average of $${bestDayData.average.toFixed(2)}.`,
        impact: 'low',
        actionable: false,
        priority: 5,
      });
    }
  }

  return insights.sort((a, b) => a.priority - b.priority);
}

// AI Insights Component
function AIInsightsDashboard({ transactions }: { transactions: ApiTransaction[] }) {
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'success' | 'info' | 'tip'>('all');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    if (transactions.length > 0) {
      const generatedInsights = generateAIInsights(transactions);
      setInsights(generatedInsights);
    }
  }, [transactions]);

  const filteredInsights = insights.filter(
    insight => !dismissedInsights.has(insight.id) && 
               (filterType === 'all' || insight.type === filterType)
  );

  const handleDismiss = (insightId: string) => {
    setDismissedInsights(prev => new Set([...prev, insightId]));
  };

  const getInsightIcon = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'info': return <Info className="w-5 h-5" />;
      case 'tip': return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning': return 'bg-red-50 border-red-200 text-red-900';
      case 'success': return 'bg-green-50 border-green-200 text-green-900';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'tip': return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    }
  };

  const getInsightIconColor = (type: SpendingInsight['type']) => {
    switch (type) {
      case 'warning': return 'text-red-600';
      case 'success': return 'text-green-600';
      case 'info': return 'text-blue-600';
      case 'tip': return 'text-yellow-600';
    }
  };

  const getImpactBadge = (impact: SpendingInsight['impact']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[impact]}`}>
        {impact.toUpperCase()} IMPACT
      </span>
    );
  };

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-400" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Insights Yet</h3>
        <p className="text-gray-600">
          Add more transactions to get personalized AI-powered insights about your spending habits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
        </div>
        <p className="text-purple-100">
          Personalized recommendations based on your spending patterns
        </p>
        <div className="mt-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">
            {filteredInsights.length} insights found
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-gray-500" />
        {[
          { value: 'all', label: 'All Insights' },
          { value: 'warning', label: 'Warnings' },
          { value: 'success', label: 'Wins' },
          { value: 'info', label: 'Info' },
          { value: 'tip', label: 'Tips' },
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setFilterType(filter.value as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filterType === filter.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className={`border rounded-xl overflow-hidden transition-all ${getInsightColor(insight.type)} ${
              expandedInsight === insight.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-lg bg-white ${getInsightIconColor(insight.type)}`}>
                  {getInsightIcon(insight.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{insight.title}</h3>
                        {getImpactBadge(insight.impact)}
                      </div>
                      <p className="text-sm opacity-90">{insight.message}</p>
                    </div>
                    
                    <button
                      onClick={() => handleDismiss(insight.id)}
                      className="p-1 hover:bg-white/20 rounded transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Category & Amount */}
                  {(insight.category || insight.amount) && (
                    <div className="flex items-center gap-4 text-sm mt-2">
                      {insight.category && (
                        <span className="px-2 py-1 bg-white rounded-full font-medium">
                          {insight.category}
                        </span>
                      )}
                      {insight.amount && (
                        <span className="font-bold">
                          ${insight.amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  {insight.actionable && insight.actions && (
                    <div className="mt-3">
                      <button
                        onClick={() => setExpandedInsight(
                          expandedInsight === insight.id ? null : insight.id
                        )}
                        className="flex items-center gap-2 text-sm font-semibold hover:underline"
                      >
                        View Actions
                        <ChevronDown className={`w-4 h-4 transition-transform ${
                          expandedInsight === insight.id ? 'rotate-180' : ''
                        }`} />
                      </button>

                      {expandedInsight === insight.id && (
                        <div className="mt-3 space-y-2">
                          {insight.actions.map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              className="flex items-center gap-2 w-full p-3 bg-white rounded-lg hover:bg-opacity-80 transition text-sm font-medium"
                            >
                              <ArrowRight className="w-4 h-4 flex-shrink-0" />
                              {action}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Priority Indicator */}
            <div className="h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30" />
          </div>
        ))}
      </div>

      {/* Empty State for Filtered */}
      {filteredInsights.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">
            No {filterType} insights found. Try a different filter.
          </p>
        </div>
      )}
    </div>
  );
}

// Main Page Component
export default function InsightsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await transactionsAPI.getAll();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Failed to load transactions:", error);
      setError(error?.message || "Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-4">
            <p className="text-red-600 font-semibold mb-2">
              ⚠️ Error Loading Insights
            </p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={loadTransactions}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered Insights</h1>
              <p className="text-gray-600">Smart analysis of your spending patterns and behavior</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <AIInsightsDashboard transactions={transactions} />
      </main>
    </div>
  );
}
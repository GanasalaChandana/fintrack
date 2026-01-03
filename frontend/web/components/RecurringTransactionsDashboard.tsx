// components/RecurringTransactionsDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  RefreshCw, Calendar, DollarSign, TrendingUp, CheckCircle, 
  AlertCircle, ChevronDown, Eye, Settings, Trash2, Plus 
} from 'lucide-react';
import { 
  detectRecurringTransactions, 
  createRecurringRule,
  type Transaction, 
  type RecurringTransaction 
} from '@/lib/utils/recurringDetector';

interface RecurringTransactionsDashboardProps {
  transactions: Transaction[];
  onCreateRule?: (rule: any) => void;
  onDeleteRecurring?: (id: string) => void;
}

export function RecurringTransactionsDashboard({ 
  transactions,
  onCreateRule,
  onDeleteRecurring,
}: RecurringTransactionsDashboardProps) {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterFrequency, setFilterFrequency] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');

  useEffect(() => {
    if (transactions.length > 0) {
      setIsLoading(true);
      
      console.log('🔍 Starting recurring detection...');
      console.log('📊 Total transactions:', transactions.length);
      console.log('📝 First transaction sample:', transactions[0]);
      
      // Simulate processing time for better UX
      setTimeout(() => {
        const detected = detectRecurringTransactions(transactions, 2, 0.5); // Lower thresholds for testing
        
        console.log('✅ Detected recurring patterns:', detected.length);
        if (detected.length > 0) {
          console.log('📋 First recurring pattern:', detected[0]);
        }
        
        setRecurring(detected);
        setIsLoading(false);
      }, 500);
    } else {
      console.log('⚠️ No transactions provided');
      setIsLoading(false);
    }
  }, [transactions]);

  const filteredRecurring = recurring.filter(
    r => filterFrequency === 'all' || r.pattern.frequency === filterFrequency
  );

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      yearly: 'Yearly',
    };
    return labels[frequency] || frequency;
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: Record<string, string> = {
      weekly: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      biweekly: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      monthly: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      quarterly: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      yearly: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-200',
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const totalMonthlyRecurring = recurring
    .filter(r => r.pattern.type === 'EXPENSE')
    .reduce((sum, r) => {
      let monthlyAmount = r.pattern.amount;
      switch (r.pattern.frequency) {
        case 'weekly': monthlyAmount = r.pattern.amount * 4.33; break;
        case 'biweekly': monthlyAmount = r.pattern.amount * 2.17; break;
        case 'quarterly': monthlyAmount = r.pattern.amount / 3; break;
        case 'yearly': monthlyAmount = r.pattern.amount / 12; break;
      }
      return sum + monthlyAmount;
    }, 0);

  const potentialSavings = recurring
    .filter(r => r.savings)
    .reduce((sum, r) => sum + (r.savings || 0), 0);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Analyzing Transactions...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Detecting recurring patterns in your spending
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Analyzing {transactions.length} transactions
          </p>
        </div>
      </div>
    );
  }

  if (recurring.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Recurring Transactions Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We analyzed {transactions.length} transactions but couldn't detect any recurring patterns yet.
          </p>
          <div className="text-left max-w-md mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              💡 Tips for Detection:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Add at least 3 similar transactions</li>
              <li>• Transactions should occur regularly (weekly, monthly, etc.)</li>
              <li>• Amounts should be relatively consistent</li>
              <li>• Descriptions should be similar</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-black">{recurring.length}</span>
          </div>
          <p className="font-semibold">Recurring Transactions</p>
          <p className="text-xs opacity-80 mt-1">Detected patterns</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-black">${totalMonthlyRecurring.toFixed(0)}</span>
          </div>
          <p className="font-semibold">Monthly Recurring</p>
          <p className="text-xs opacity-80 mt-1">Total expenses</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-black">${potentialSavings.toFixed(0)}</span>
          </div>
          <p className="font-semibold">Potential Savings</p>
          <p className="text-xs opacity-80 mt-1">Annual estimate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by frequency:
        </span>
        {['all', 'weekly', 'monthly', 'yearly'].map(freq => (
          <button
            key={freq}
            onClick={() => setFilterFrequency(freq as any)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              filterFrequency === freq
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {freq.charAt(0).toUpperCase() + freq.slice(1)}
          </button>
        ))}
      </div>

      {/* Recurring List */}
      <div className="space-y-3">
        {filteredRecurring.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {item.pattern.description}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getFrequencyColor(item.pattern.frequency)}`}>
                      {getFrequencyLabel(item.pattern.frequency)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.pattern.category} • {item.transactions.length} occurrences
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900 dark:text-white">
                    ${item.pattern.amount.toFixed(2)}
                  </div>
                  <div className={`text-xs font-semibold ${getConfidenceColor(item.confidence)}`}>
                    {(item.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Next: {new Date(item.nextExpectedDate).toLocaleDateString()}
                  </span>
                </div>

                {item.pattern.dayOfWeek !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item.pattern.dayOfWeek]}
                    </span>
                  </div>
                )}

                {item.pattern.dayOfMonth !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Day {item.pattern.dayOfMonth}
                    </span>
                  </div>
                )}

                {item.savings && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      ${item.savings.toFixed(0)}/year potential
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition font-medium"
                >
                  <Eye className="w-4 h-4" />
                  View History
                  <ChevronDown className={`w-4 h-4 transition-transform ${expandedId === item.id ? 'rotate-180' : ''}`} />
                </button>

                {onCreateRule && (
                  <button
                    onClick={() => onCreateRule(createRecurringRule(item))}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Create Rule
                  </button>
                )}

                {onDeleteRecurring && (
                  <button
                    onClick={() => onDeleteRecurring(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Expanded History */}
              {expandedId === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Transaction History
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {item.transactions.map((txn, index) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {new Date(txn.date).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${txn.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
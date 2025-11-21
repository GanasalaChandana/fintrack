"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, AlertCircle, 
  ArrowUp, ArrowDown, Plus, Download, RefreshCw, Calendar, X, FileText, Tag
} from 'lucide-react';
import { transactionsAPI, type Transaction } from '@/lib/api';

// Types
type CategoryData = {
  name: string;
  value: number;
  color: string;
};

type SpendingData = {
  month: string;
  expenses: number;
  income: number;
};

type PeriodType = 'week' | 'month' | 'quarter' | 'year';
type Trend = 'up' | 'down';
type InsightType = 'warning' | 'success' | 'prediction';

interface StatCardProps {
  title: string;
  value: number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: Trend;
  color: string;
}

interface InsightCardProps {
  type: InsightType;
  message: string;
  action: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionText: string;
  onAction: () => void;
}

interface Insights {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  balance: number;
  expenseChange: string;
  incomeChange: string;
  savingsChange: string;
}

interface DynamicInsight {
  type: InsightType;
  message: string;
  action: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
}

const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Personal Care',
  'Home & Garden',
  'Travel',
  'Insurance',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Rental Income',
  'Gift',
  'Refund',
  'Other'
];

// Utility Functions
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Filter transactions by period
const filterByPeriod = (transactions: Transaction[], period: PeriodType): Transaction[] => {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return transactions.filter(t => new Date(t.date) >= startDate);
};

// Calculate insights
const calculateInsights = (transactions: Transaction[], period: PeriodType): Insights => {
  const filtered = filterByPeriod(transactions, period);
  const expenses = filtered.filter(t => t.type === 'expense');
  const income = filtered.filter(t => t.type === 'income');
  
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const savings = totalIncome - totalExpenses;
  
  const prevPeriod = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
  const prevStart = new Date();
  prevStart.setDate(prevStart.getDate() - (prevPeriod * 2));
  const prevEnd = new Date();
  prevEnd.setDate(prevEnd.getDate() - prevPeriod);
  
  const prevTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date >= prevStart && date <= prevEnd;
  });
  
  const prevExpenses = prevTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const expenseChange = prevExpenses > 0 
    ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 
    : 0;
  
  return {
    totalIncome,
    totalExpenses,
    savings,
    balance: 4567.89 + savings,
    expenseChange: expenseChange.toFixed(1),
    incomeChange: '8.1',
    savingsChange: totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0'
  };
};

// Add Transaction Modal Component
const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setCategory('');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!merchant.trim()) {
      newErrors.merchant = 'Merchant/Source is required';
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const transaction: Omit<Transaction, 'id'> = {
        description: description.trim(),
        merchant: merchant.trim(),
        amount: parseFloat(amount),
        category,
        date,
        type: transactionType
      };

      await onAdd(transaction);
      handleClose();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      setErrors({ submit: 'Failed to add transaction. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setMerchant('');
    setAmount('');
    setCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setTransactionType('expense');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Transaction</h2>
              <p className="text-sm text-gray-500 mt-1">Track your income or expenses</p>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" disabled={isSubmitting}>
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    transactionType === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <TrendingDown className="w-5 h-5" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                    transactionType === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <TrendingUp className="w-5 h-5" />
                  Income
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Grocery shopping"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.description ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 mb-2">
                {transactionType === 'income' ? 'Source *' : 'Merchant *'}
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="merchant"
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder={transactionType === 'income' ? 'e.g., Company Name' : 'e.g., Walmart'}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.merchant ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.merchant && <p className="mt-1 text-sm text-red-600">{errors.merchant}</p>}
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.amount ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all appearance-none bg-white ${
                    errors.category ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.date ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                  transactionType === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  `Add ${transactionType === 'income' ? 'Income' : 'Expense'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Other Components
const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {change}%
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</p>
    </div>
  </div>
);

const InsightCard: React.FC<InsightCardProps> = ({ type, message, action, onClick }) => {
  const styles: Record<InsightType, string> = {
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    prediction: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons: Record<InsightType, string> = {
    warning: '⚠️',
    success: '🎯',
    prediction: '📈',
  };
  return (
    <div className={`p-4 rounded-lg border ${styles[type]} mb-3`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[type]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium mb-2">{message}</p>
          <button onClick={onClick} className="text-xs font-semibold underline hover:no-underline transition-all">
            {action} →
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionText, onAction }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Calendar className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 text-center mb-4 max-w-sm">{description}</p>
    <button onClick={onAction} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
      {actionText}
    </button>
  </div>
);

const SkeletonLoader: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
      ))}
    </div>
    <div className="h-96 bg-gray-200 rounded-xl"></div>
  </div>
);

// Main Dashboard Component
export default function Dashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load transactions from API
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await transactionsAPI.getAll();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => 
    filterByPeriod(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  const insights = useMemo(() => 
    calculateInsights(transactions, selectedPeriod),
    [transactions, selectedPeriod]
  );

  const spendingData = useMemo((): SpendingData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => {
      const monthTransactions = filteredTransactions.filter(t => {
        const date = new Date(t.date);
        return date.toLocaleString('en-US', { month: 'short' }) === month;
      });
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return { month, income, expenses };
    });
  }, [filteredTransactions]);

  const categoryData = useMemo((): CategoryData[] => {
    const categories: { [key: string]: number } = {};
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6b7280', '#ef4444'];
    
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    });
    
    return Object.entries(categories)
      .map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTransactions]);

  const dynamicInsights = useMemo((): DynamicInsight[] => {
    const insightsList: DynamicInsight[] = [];
    const expenseChange = parseFloat(insights.expenseChange);
    
    if (expenseChange > 15) {
      insightsList.push({
        type: 'warning',
        message: `Your expenses are ${expenseChange.toFixed(0)}% higher than last ${selectedPeriod}`,
        action: 'Review spending'
      });
    }
    
    const savingsRate = (insights.savings / insights.totalIncome) * 100;
    if (savingsRate > 20 && !isNaN(savingsRate)) {
      insightsList.push({
        type: 'success',
        message: `Great job! You're saving ${savingsRate.toFixed(0)}% of your income`,
        action: 'View savings goal'
      });
    }
    
    const topCategory = categoryData[0];
    if (topCategory && topCategory.value > insights.totalExpenses * 0.3) {
      insightsList.push({
        type: 'prediction',
        message: `${topCategory.name} is your highest expense at ${formatCurrency(topCategory.value)}`,
        action: 'Set category budget'
      });
    }
    
    return insightsList.slice(0, 3);
  }, [insights, selectedPeriod, categoryData]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>) => {
    try {
      const created = await transactionsAPI.create(newTransaction);
      setTransactions(prev => [created, ...prev]);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTransactions();
    setIsRefreshing(false);
  };

  const handleExport = async () => {
    try {
      const blob = await transactionsAPI.exportCsv({ period: selectedPeriod });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fintrack-transactions-${selectedPeriod}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export transactions. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTransactions}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Transaction added successfully!
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your financial overview</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as PeriodType)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Current Balance" 
            value={insights.balance} 
            change="2.5" 
            icon={DollarSign} 
            trend="up" 
            color="from-blue-500 to-blue-600" 
          />
          <StatCard 
            title="Total Income" 
            value={insights.totalIncome} 
            change={insights.incomeChange} 
            icon={TrendingUp} 
            trend="up" 
            color="from-green-500 to-green-600" 
          />
          <StatCard 
            title="Total Expenses" 
            value={insights.totalExpenses} 
            change={insights.expenseChange} 
            icon={CreditCard} 
            trend="down" 
            color="from-red-500 to-red-600" 
          />
          <StatCard 
            title="Total Savings" 
            value={insights.savings} 
            change={insights.savingsChange} 
            icon={PiggyBank} 
            trend="up" 
            color="from-purple-500 to-purple-600" 
          />
        </div>

        {filteredTransactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description={`You haven't added any transactions for this ${selectedPeriod}. Start tracking your finances by adding your first transaction.`}
            actionText="Add Transaction"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spending Trends Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Spending Trends</h2>
                  <p className="text-sm text-gray-500">Income vs Expenses over time</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={spendingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: number | string) => formatCurrency(Number(v))}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
                  <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* AI Insights Panel */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">AI Insights</h2>
              </div>
              {dynamicInsights.length > 0 ? (
                dynamicInsights.map((insight, index) => (
                  <InsightCard
                    key={index}
                    type={insight.type}
                    message={insight.message}
                    action={insight.action}
                    onClick={() => alert(`${insight.action} feature coming soon!`)}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">Add more transactions to see personalized insights!</p>
              )}
            </div>

            {/* Category Breakdown */}
            {categoryData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie 
                      data={categoryData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={90} 
                      paddingAngle={2} 
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number | string) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-gray-700">{category.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(category.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
                <a href="/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  View all →
                </a>
              </div>
              <div className="space-y-3">
                {filteredTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-500">
                          {transaction.category} • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
}
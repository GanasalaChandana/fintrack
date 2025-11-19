"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, CreditCard, PiggyBank, AlertCircle, 
  ArrowUp, ArrowDown
} from 'lucide-react';

type Trend = 'up' | 'down';
type InsightType = 'warning' | 'success' | 'prediction';
type SpendingPoint = { month: string; expenses: number; income: number };
type CategorySlice = { name: string; value: number; color: string };
type TxnType = 'income' | 'expense';
type Transaction = {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: TxnType;
};

type DashboardData = {
  spendingData: SpendingPoint[];
  categoryData: CategorySlice[];
  recentTransactions: Transaction[];
};

type StatCardProps = {
  title: string;
  value: number;
  change: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: Trend;
  color: string;
};

type InsightCardProps = {
  type: InsightType;
  message: string;
  action: string;
};

const generateMockData = (): DashboardData => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const spendingData: SpendingPoint[] = months.map((month) => ({
    month,
    expenses: Math.floor(Math.random() * 2000) + 1500,
    income: Math.floor(Math.random() * 1000) + 3500,
  }));

  const categoryData: CategorySlice[] = [
    { name: 'Food & Dining', value: 450, color: '#3b82f6' },
    { name: 'Transportation', value: 230, color: '#8b5cf6' },
    { name: 'Shopping', value: 180, color: '#ec4899' },
    { name: 'Entertainment', value: 120, color: '#f59e0b' },
    { name: 'Bills & Utilities', value: 350, color: '#10b981' },
    { name: 'Others', value: 90, color: '#6b7280' },
  ];

  const recentTransactions: Transaction[] = [
    { id: 1, description: 'Starbucks Coffee', amount: -5.8, category: 'Food & Dining', date: '2025-11-17', type: 'expense' },
    { id: 2, description: 'Salary Deposit', amount: 3500, category: 'Income', date: '2025-11-15', type: 'income' },
    { id: 3, description: 'Amazon Purchase', amount: -89.99, category: 'Shopping', date: '2025-11-16', type: 'expense' },
    { id: 4, description: 'Uber Ride', amount: -15.5, category: 'Transportation', date: '2025-11-17', type: 'expense' },
    { id: 5, description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2025-11-14', type: 'expense' },
  ];

  return { spendingData, categoryData, recentTransactions };
};

const formatCurrency = (value: number | string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(typeof value === 'string' ? Number(value) : value);

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          {change}
        </div>
      )}
    </div>
    <div>
      <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</p>
    </div>
  </div>
);

const InsightCard: React.FC<InsightCardProps> = ({ type, message, action }) => {
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
          <button className="text-xs font-semibold underline hover:no-underline">{action} →</button>
        </div>
      </div>
    </div>
  );
};

export default function FinTrackDashboard() {
  const router = useRouter();
  const [data] = useState<DashboardData>(generateMockData());
  const [selectedPeriod, setSelectedPeriod] = useState<'This Week' | 'This Month' | 'This Quarter' | 'This Year'>('This Month');
  const [animatedValues, setAnimatedValues] = useState<{ balance: number; income: number; expenses: number; savings: number }>({
    balance: 0, income: 0, expenses: 0, savings: 0,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  // Animated values
  useEffect(() => {
    if (!isAuthenticated) return;

    const targets = { balance: 4567.89, income: 5200.0, expenses: 1420.35, savings: 3779.65 };
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      setAnimatedValues({
        balance: targets.balance * progress,
        income: targets.income * progress,
        expenses: targets.expenses * progress,
        savings: targets.savings * progress,
      });
      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues(targets);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  // Show loading or nothing while checking auth
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your financial overview</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as typeof selectedPeriod)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Current Balance" value={animatedValues.balance} change="2.5%" icon={DollarSign} trend="up" color="from-blue-500 to-blue-600" />
          <StatCard title="Total Income" value={animatedValues.income} change="8.1%" icon={TrendingUp} trend="up" color="from-green-500 to-green-600" />
          <StatCard title="Total Expenses" value={animatedValues.expenses} change="3.2%" icon={CreditCard} trend="down" color="from-red-500 to-red-600" />
          <StatCard title="Total Savings" value={animatedValues.savings} change="12.4%" icon={PiggyBank} trend="up" color="from-purple-500 to-purple-600" />
        </div>

        {/* Main Content Grid */}
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
              <LineChart data={data.spendingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: number | string) => formatCurrency(v)}
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
            <InsightCard type="warning" message="Your dining expenses are 23% higher than last month" action="Set budget alert" />
            <InsightCard type="success" message="You saved $150 more than your goal this month!" action="Increase savings goal" />
            <InsightCard type="prediction" message="Based on trends, you'll exceed budget by $200" action="Review spending" />
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={data.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number | string) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.categoryData.map((category, index) => (
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

          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
              <a href="/transactions" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View all →
              </a>
            </div>
            <div className="space-y-3">
              {data.recentTransactions.map((transaction) => (
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
                        {transaction.category} • {transaction.date}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}
                  >
                    {transaction.type === 'income' ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
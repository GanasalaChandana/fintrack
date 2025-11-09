'use client';

import { useEffect, useState } from 'react';
import { transactionService, type Transaction } from '@/lib/api/services/transaction.service';
import { budgetService, type Budget } from '@/lib/api/services/budget.service';

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  budgetStatus: number;
  budgetRemaining: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCount: 0,
    budgetStatus: 0,
    budgetRemaining: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch transactions with proper typing
      const transactions: Transaction[] = await transactionService.getAll();
      
      // Calculate stats
      const income = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Fetch budget data with proper typing
      const budgets: Budget[] = await budgetService.getAll();
      const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
      const budgetUsed = totalBudget > 0 ? (expenses / totalBudget) * 100 : 0;
      
      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        netIncome: income - expenses,
        transactionCount: transactions.length,
        budgetStatus: Math.min(budgetUsed, 100),
        budgetRemaining: Math.max(totalBudget - expenses, 0)
      });
      
      // Get recent 5 transactions
      const sorted = [...transactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentTransactions(sorted.slice(0, 5));
      
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview</p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Income"
          value={`$${stats.totalIncome.toFixed(2)}`}
          subtitle={`${stats.transactionCount} transactions`}
          icon="📈"
          bgColor="bg-green-100"
          textColor="text-green-600"
        />
        <StatCard
          title="Total Expenses"
          value={`$${stats.totalExpenses.toFixed(2)}`}
          subtitle={`${stats.transactionCount} transactions`}
          icon="📉"
          bgColor="bg-red-100"
          textColor="text-red-600"
        />
        <StatCard
          title="Net Income"
          value={`$${stats.netIncome.toFixed(2)}`}
          subtitle={stats.netIncome >= 0 ? 'Surplus' : 'Deficit'}
          icon="💰"
          bgColor="bg-blue-100"
          textColor={stats.netIncome >= 0 ? 'text-blue-600' : 'text-red-600'}
        />
        <StatCard
          title="Budget Status"
          value={`${stats.budgetStatus.toFixed(0)}%`}
          subtitle={`$${stats.budgetRemaining.toFixed(2)} remaining`}
          icon="🎯"
          bgColor="bg-purple-100"
          textColor={stats.budgetStatus < 80 ? 'text-purple-600' : 'text-orange-600'}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <a 
            href="/transactions" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </a>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <p className="text-gray-500 mb-4">No transactions yet</p>
            <a
              href="/transactions"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Add Your First Transaction
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="flex justify-between items-center border-b pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className="text-xl">
                      {transaction.type === 'INCOME' ? '💵' : '💸'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-bold text-lg ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <QuickActionCard
          title="Add Transaction"
          description="Record a new income or expense"
          icon="➕"
          href="/transactions"
          color="blue"
        />
        <QuickActionCard
          title="Set Budget"
          description="Create or update your budget"
          icon="🎯"
          href="/budget"
          color="purple"
        />
        <QuickActionCard
          title="View Reports"
          description="Analyze your spending patterns"
          icon="📊"
          href="/reports"
          color="green"
        />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

function StatCard({ title, value, subtitle, icon, bgColor, textColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className={`text-2xl ${bgColor} p-2 rounded-lg`}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold mb-1 ${textColor}`}>{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: 'blue' | 'purple' | 'green';
}

function QuickActionCard({ title, description, icon, href, color }: QuickActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600',
    green: 'bg-green-50 hover:bg-green-100 text-green-600'
  };

  return (
    <a
      href={href}
      className={`block ${colorClasses[color]} rounded-lg p-6 transition-colors cursor-pointer`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </a>
  );
}
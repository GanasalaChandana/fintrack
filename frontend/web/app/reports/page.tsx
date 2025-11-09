'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  category: string;
  type: 'EXPENSE' | 'INCOME';
  description: string;
  merchant?: string;
}

interface Budget {
  category: string;
  budgeted: number;
  spent: number;
  percentage: number;
}

interface PaginatedResponse {
  content: Transaction[];
  totalElements: number;
  totalPages: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function EnhancedReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'budget' | 'comparison'>('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Mock budgets - In production, fetch from backend
  const budgets: Budget[] = [
    { category: 'Food', budgeted: 500, spent: 0, percentage: 0 },
    { category: 'Shopping', budgeted: 300, spent: 0, percentage: 0 },
    { category: 'Entertainment', budgeted: 200, spent: 0, percentage: 0 },
    { category: 'Other', budgeted: 400, spent: 0, percentage: 0 },
  ];

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8082/api/transactions?size=1000', {
        headers: {
          'X-User-Id': 'test-user-123',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data: PaginatedResponse = await response.json();
      const allTransactions = data.content || [];
      
      const filtered = allTransactions.filter((t: Transaction) => {
        return t.date >= dateRange.startDate && t.date <= dateRange.endDate;
      });
      
      setTransactions(filtered);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate spending by category
  const getSpendingByCategory = () => {
    const categoryMap = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + Math.abs(t.amount));
      });

    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculate monthly trends
  const getMonthlyTrends = () => {
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    transactions.forEach(t => {
      const monthKey = t.date.substring(0, 7);
      const current = monthlyData.get(monthKey) || { income: 0, expenses: 0 };
      
      if (t.type === 'INCOME') {
        current.income += Math.abs(t.amount);
      } else {
        current.expenses += Math.abs(t.amount);
      }
      
      monthlyData.set(monthKey, current);
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  // Calculate budget vs actual
  const getBudgetComparison = () => {
    const categorySpending = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'EXPENSE')
      .forEach(t => {
        const current = categorySpending.get(t.category) || 0;
        categorySpending.set(t.category, current + Math.abs(t.amount));
      });

    return budgets.map(budget => {
      const spent = categorySpending.get(budget.category) || 0;
      const percentage = budget.budgeted > 0 ? (spent / budget.budgeted) * 100 : 0;
      return {
        category: budget.category,
        budgeted: budget.budgeted,
        spent: spent,
        remaining: Math.max(0, budget.budgeted - spent),
        percentage: Math.min(percentage, 100),
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });
  };

  // Year over Year comparison
  const getYearOverYearComparison = () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const monthlyComparison = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' });
      
      const currentYearData = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getFullYear() === currentYear && txDate.getMonth() === i;
      });
      
      const lastYearData = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getFullYear() === lastYear && txDate.getMonth() === i;
      });
      
      const currentYearTotal = currentYearData
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const lastYearTotal = lastYearData
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      return {
        month,
        currentYear: currentYearTotal,
        lastYear: lastYearTotal,
        difference: currentYearTotal - lastYearTotal,
        percentChange: lastYearTotal > 0 ? ((currentYearTotal - lastYearTotal) / lastYearTotal) * 100 : 0
      };
    });
    
    return monthlyComparison;
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const stats = getSummaryStats();
    
    // Title
    doc.setFontSize(20);
    doc.text('Financial Report', 14, 20);
    
    // Date Range
    doc.setFontSize(12);
    doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, 30);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Income: $${stats.totalIncome.toFixed(2)}`, 14, 55);
    doc.text(`Total Expenses: $${stats.totalExpenses.toFixed(2)}`, 14, 62);
    doc.text(`Net Savings: $${stats.netSavings.toFixed(2)}`, 14, 69);
    
    // Transactions Table
    const tableData = transactions.slice(0, 50).map(t => [
      t.date,
      t.description,
      t.category,
      t.type,
      `$${Math.abs(t.amount).toFixed(2)}`
    ]);
    
    (doc as any).autoTable({
      startY: 80,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    doc.save(`financial-report-${dateRange.startDate}.pdf`);
  };

  // Export to Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const stats = getSummaryStats();
    
    // Summary Sheet
    const summaryData = [
      ['Financial Report'],
      ['Period', `${dateRange.startDate} to ${dateRange.endDate}`],
      [],
      ['Metric', 'Value'],
      ['Total Income', stats.totalIncome],
      ['Total Expenses', stats.totalExpenses],
      ['Net Savings', stats.netSavings],
      ['Transaction Count', transactions.length]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    
    // Transactions Sheet
    const transactionsData = transactions.map(t => ({
      Date: t.date,
      Description: t.description,
      Merchant: t.merchant || '',
      Category: t.category,
      Type: t.type,
      Amount: Math.abs(t.amount)
    }));
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(wb, transactionsSheet, 'Transactions');
    
    // Category Breakdown Sheet
    const categoryData = getSpendingByCategory();
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(wb, categorySheet, 'By Category');
    
    XLSX.writeFile(wb, `financial-report-${dateRange.startDate}.xlsx`);
  };

  // Get summary statistics
  const getSummaryStats = () => {
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const income = transactions.filter(t => t.type === 'INCOME');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

    return {
      totalExpenses,
      totalIncome,
      netSavings: totalIncome - totalExpenses,
      avgExpense,
      transactionCount: transactions.length,
      expenseCount: expenses.length,
      incomeCount: income.length,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    };
  };

  const categoryData = getSpendingByCategory();
  const monthlyData = getMonthlyTrends();
  const budgetData = getBudgetComparison();
  const yoyData = getYearOverYearComparison();
  const stats = getSummaryStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reports & Analytics</h1>
            <p className="text-gray-600">Comprehensive financial insights and trends</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
            >
              📄 Export PDF
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">Date Range</h3>
          <div className="flex gap-4 items-center flex-wrap">
            <div>
              <label className="block text-sm text-gray-600 mb-1">From</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">To</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setDateRange({
                  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
              >
                This Month
              </button>
              <button
                onClick={() => setDateRange({
                  startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
              >
                This Year
              </button>
              <button
                onClick={() => setDateRange({
                  startDate: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0],
                  endDate: new Date(new Date().getFullYear() - 1, 11, 31).toISOString().split('T')[0]
                })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
              >
                Last Year
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {['overview', 'trends', 'budget', 'comparison'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Income</div>
            <div className="text-2xl font-bold text-green-600">${stats.totalIncome.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.incomeCount} transactions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
            <div className="text-2xl font-bold text-red-600">${stats.totalExpenses.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.expenseCount} transactions</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Net Savings</div>
            <div className={`text-2xl font-bold ${stats.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${stats.netSavings.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.savingsRate.toFixed(1)}% savings rate
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Avg. Expense</div>
            <div className="text-2xl font-bold text-gray-900">${stats.avgExpense.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">per transaction</div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No expense data available
                </div>
              )}
            </div>

            {/* Category Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            {/* Monthly Income vs Expenses */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Income vs Expenses</h3>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Income" />
                    <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  No trend data available
                </div>
              )}
            </div>

            {/* Net Savings Trend */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Net Savings Trend</h3>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} name="Net Savings" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No trend data available
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            {/* Budget Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {budgetData.map((budget) => (
                <div key={budget.category} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{budget.category}</div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      budget.status === 'over' ? 'bg-red-100 text-red-700' :
                      budget.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">${budget.budgeted.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spent:</span>
                      <span className="font-medium">${budget.spent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-medium ${budget.remaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${budget.remaining.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        budget.status === 'over' ? 'bg-red-600' :
                        budget.status === 'warning' ? 'bg-yellow-500' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Budget vs Actual Spending</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#94a3b8" name="Budgeted" />
                  <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="space-y-6">
            {/* Year over Year Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Year-over-Year Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={yoyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="lastYear" fill="#94a3b8" name={`${new Date().getFullYear() - 1}`} />
                  <Bar dataKey="currentYear" fill="#3b82f6" name={`${new Date().getFullYear()}`} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* YoY Table */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Monthly Comparison Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Last Year</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">This Year</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Difference</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Change %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {yoyData.map((row) => (
                      <tr key={row.month} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">{row.month}</td>
                        <td className="px-4 py-3 text-sm text-right">${row.lastYear.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right">${row.currentYear.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${
                          row.difference > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ${Math.abs(row.difference).toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-sm text-right font-medium ${
                          row.percentChange > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {row.percentChange > 0 ? '+' : ''}{row.percentChange.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
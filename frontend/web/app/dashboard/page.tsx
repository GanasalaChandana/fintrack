'use client';

import { useState, useEffect } from 'react';
import SpendingChart from '@/components/charts/SpendingChart';
import CategoryPieChart from '@/components/charts/CategoryPieChart';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
//import '@/app/dashboard/dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData = {
        totalSpending: 2450.75,
        totalIncome: 5000.00,
        transactionCount: 42,
        categories: [
          { categoryName: 'Food & Dining', amount: 850.50, count: 15, percentage: 34.7 },
          { categoryName: 'Transportation', amount: 420.25, count: 8, percentage: 17.2 },
          { categoryName: 'Shopping', amount: 680.00, count: 12, percentage: 27.8 },
          { categoryName: 'Entertainment', amount: 300.00, count: 5, percentage: 12.2 },
          { categoryName: 'Utilities', amount: 200.00, count: 2, percentage: 8.1 }
        ],
        monthlyTrend: [
          { month: 'Jan', spending: 2200, income: 5000 },
          { month: 'Feb', spending: 2450, income: 5000 },
          { month: 'Mar', spending: 2100, income: 5200 },
          { month: 'Apr', spending: 2600, income: 5000 },
          { month: 'May', spending: 2450, income: 5000 }
        ]
      };
      
      setSummaryData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <div className="date-range-selector">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Spending</h3>
          <p className="amount spending">${summaryData.totalSpending.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Total Income</h3>
          <p className="amount income">${summaryData.totalIncome.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Net Savings</h3>
          <p className="amount savings">
            ${(summaryData.totalIncome - summaryData.totalSpending).toFixed(2)}
          </p>
        </div>
        <div className="card">
          <h3>Transactions</h3>
          <p className="amount">{summaryData.transactionCount}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h2>Spending vs Income</h2>
          <SpendingChart data={summaryData} />
        </div>

        <div className="chart-card">
          <h2>Spending by Category</h2>
          <CategoryPieChart data={summaryData} />
        </div>

        <div className="chart-card full-width">
          <h2>Monthly Trend</h2>
          <MonthlyTrendChart data={summaryData.monthlyTrend} />
        </div>
      </div>

      {/* Category Details Table */}
      <div className="category-table">
        <h2>Category Details</h2>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Transactions</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {summaryData.categories.map((cat: any, index: number) => (
              <tr key={index}>
                <td>{cat.categoryName}</td>
                <td>${cat.amount.toFixed(2)}</td>
                <td>{cat.count}</td>
                <td>{cat.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
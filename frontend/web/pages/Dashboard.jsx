import React, { useEffect, useState, useCallback, useRef } from 'react';
import { healthAPI, transactionsAPI } from '../lib/api';
import './Dashboard.css';

function Dashboard() {
  // API Connection State
  const [apiStatus, setApiStatus] = useState({
    checking: true,
    backend: false,
    transactions: false,
    budgets: false,
    alerts: false
  });

  // Data State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    transactionCount: 0
  });

  // Prevent multiple simultaneous API checks
  const isCheckingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Memoized function to check API connection
  const checkAPIConnection = useCallback(async () => {
    // Prevent duplicate checks
    if (isCheckingRef.current) {
      console.log('⏭️ Skipping duplicate API check');
      return;
    }

    isCheckingRef.current = true;

    try {
      setApiStatus(prev => ({ ...prev, checking: true }));
      console.log('🔍 Checking API connection...');
      
      // Use healthAPI from your API client
      const health = await healthAPI.checkAll().catch(() => ({
        connected: false,
        gateway: { connected: false }
      }));

      console.log('✅ Health check results:', health);
      
      const newStatus = {
        checking: false,
        backend: health.connected || false,
        transactions: health.transactions?.connected || false,
        budgets: health.budgets?.connected || false,
        alerts: false
      };

      setApiStatus(newStatus);
      
      if (!newStatus.backend) {
        setError('Backend gateway is not available. Please check if services are running.');
      }

      // If backend is connected and we haven't loaded data yet, load it
      if (newStatus.backend && !hasLoadedRef.current) {
        hasLoadedRef.current = true;
        loadDashboardData();
      }
    } catch (error) {
      console.error('❌ API check failed:', error);
      setApiStatus({
        checking: false,
        backend: false,
        transactions: false,
        budgets: false,
        alerts: false
      });
      setError('Cannot connect to backend: ' + (error.message || 'Unknown error'));
    } finally {
      isCheckingRef.current = false;
    }
  }, []); // No dependencies - function is stable

  // Memoized function to load dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading dashboard data...');

      // Fetch transactions with error handling
      const txRes = await transactionsAPI.getAll({ limit: 10 }).catch(err => {
        console.warn('⚠️ Transactions API error:', err);
        return { content: [] };
      });

      // Handle paginated response
      const txList = txRes.content || txRes.data || (Array.isArray(txRes) ? txRes : []);
      console.log('✅ Transactions loaded:', txList.length);

      setTransactions(txList);

      // Calculate summary from transactions
      let totalIncome = 0;
      let totalExpenses = 0;

      txList.forEach(tx => {
        const amount = Number(tx.amount) || 0;
        if (tx.type === 'INCOME' || amount > 0) {
          totalIncome += Math.abs(amount);
        } else if (tx.type === 'EXPENSE' || amount < 0) {
          totalExpenses += Math.abs(amount);
        }
      });

      const netIncome = totalIncome - totalExpenses;

      setSummary({
        totalIncome,
        totalExpenses,
        netIncome,
        transactionCount: txList.length
      });

      console.log('✅ Dashboard summary:', {
        totalIncome,
        totalExpenses,
        netIncome,
        transactions: txList.length
      });

    } catch (err) {
      console.error('❌ Dashboard load error:', err);
      setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - function is stable

  // Check API connection ONCE on mount
  useEffect(() => {
    checkAPIConnection();
  }, []); // Empty array = run once on mount only

  // Manual retry handler
  const handleRetry = useCallback(() => {
    hasLoadedRef.current = false; // Reset loaded flag
    checkAPIConnection();
  }, [checkAPIConnection]);

  // Manual refresh handler
  const handleRefresh = useCallback(() => {
    if (!loading) {
      loadDashboardData();
    }
  }, [loading, loadDashboardData]);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(n || 0));

  const formatDate = (s) => {
    try {
      return new Date(s).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return '-';
    }
  };

  // ---------- RENDER ----------

  // Loading state while checking API
  if (apiStatus.checking) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner" />
          <p>Checking API connection...</p>
        </div>
      </div>
    );
  }

  // Error state if backend not connected
  if (!apiStatus.backend) {
    return (
      <div className="dashboard">
        <div className="error-container">
          <h2>⚠️ Backend Not Connected</h2>
          <p>{error || 'Unable to connect to backend services.'}</p>
          <button className="retry-button" onClick={handleRetry}>
            Retry Connection
          </button>
          <div className="troubleshooting">
            <h3>Troubleshooting</h3>
            <ul>
              <li>Gateway URL: {process.env.NEXT_PUBLIC_API_URL || 'Not configured'}</li>
              <li>Check if all Render services are deployed and running</li>
              <li>Verify CORS settings allow your Vercel domain</li>
              <li>Check Render logs for errors</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard view
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Welcome back! Here's your financial overview</p>
        </div>
        <div className="header-actions">
          <div className="api-status">
            <span className="status-indicator connected" />
            <span>Backend Connected</span>
          </div>
          <button 
            className="refresh-button" 
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? '⟳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Service Status Info */}
      <div className="service-warnings">
        <div className="service-status-grid">
          <div className="service-status-item">
            <span className={`status-dot ${apiStatus.transactions ? 'online' : 'offline'}`}></span>
            <span className="service-name">Transactions</span>
            <span className={`status-text ${apiStatus.transactions ? 'online' : 'offline'}`}>
              {apiStatus.transactions ? '✅ Online' : '❌ Offline'}
            </span>
          </div>
          <div className="service-status-item">
            <span className={`status-dot ${apiStatus.budgets ? 'online' : 'offline'}`}></span>
            <span className="service-name">Budgets</span>
            <span className="status-text offline">❌ Not Implemented</span>
          </div>
          <div className="service-status-item">
            <span className={`status-dot ${apiStatus.alerts ? 'online' : 'offline'}`}></span>
            <span className="service-name">Alerts</span>
            <span className="status-text offline">❌ Not Implemented</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="summary-cards">
        <div className="card income">
          <div className="card-header">
            <h3>Total Income</h3>
            <span className="icon">💰</span>
          </div>
          <p className="amount">{formatCurrency(summary.totalIncome)}</p>
          <span className="subtitle">{summary.transactionCount} transactions</span>
        </div>

        <div className="card expenses">
          <div className="card-header">
            <h3>Total Expenses</h3>
            <span className="icon">💸</span>
          </div>
          <p className="amount">{formatCurrency(summary.totalExpenses)}</p>
          <span className="subtitle">{summary.transactionCount} transactions</span>
        </div>

        <div className="card net-income">
          <div className="card-header">
            <h3>Net Income</h3>
            <span className="icon">📊</span>
          </div>
          <p className={`amount ${summary.netIncome >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary.netIncome)}
          </p>
          <span className="subtitle">Income - Expenses</span>
        </div>

        <div className="card budget">
          <div className="card-header">
            <h3>Budget Status</h3>
            <span className="icon">🎯</span>
          </div>
          <p className="amount">0%</p>
          <span className="subtitle">Service unavailable</span>
        </div>
      </div>

      {/* Main content */}
      <div className="dashboard-content">
        {/* Recent Transactions */}
        <div className="section transactions-section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <span className="count">{summary.transactionCount} total</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No transactions yet</h3>
              <p>Start by adding your first transaction to track your finances.</p>
              <button
                className="primary-button"
                onClick={() => (window.location.href = '/transactions')}
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-main">
                    <div className="transaction-info">
                      <span className="description">{tx.description || 'No description'}</span>
                      <span className="date">{tx.date ? formatDate(tx.date) : '-'}</span>
                    </div>
                    <div className="transaction-details">
                      <span className="category">{tx.category || 'Uncategorized'}</span>
                      <span className={`amount ${Number(tx.amount) >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(Math.abs(Number(tx.amount) || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <button
                className="view-all-button"
                onClick={() => (window.location.href = '/transactions')}
              >
                View All Transactions →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="section quick-actions">
          <h2>Quick Actions</h2>

          <div className="action-cards">
            <div
              className="action-card"
              onClick={() => (window.location.href = '/transactions/new')}
            >
              <div className="action-icon add">➕</div>
              <div className="action-content">
                <h3>Add Transaction</h3>
                <p>Record new income or expense</p>
              </div>
            </div>

            <div className="action-card disabled">
              <div className="action-icon budget">🎯</div>
              <div className="action-content">
                <h3>Manage Budgets</h3>
                <p>Coming soon - Service not implemented</p>
              </div>
            </div>

            <div className="action-card disabled">
              <div className="action-icon reports">📈</div>
              <div className="action-content">
                <h3>View Reports</h3>
                <p>Coming soon - Service not implemented</p>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="system-status">
            <h3>System Information</h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">API Gateway:</span>
                <span className="status-badge connected">✅ Online</span>
              </div>
              <div className="status-item">
                <span className="status-label">Environment:</span>
                <span className="status-badge">{process.env.NODE_ENV || 'production'}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Available Services:</span>
                <span className="status-value">1 / 3</span>
              </div>
            </div>
            <p className="status-note">
              💡 <strong>Note:</strong> Budgets and Alerts services need REST endpoints implemented.
            </p>
          </div>
        </div>
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-info">
          <details>
            <summary>🔍 Debug Info</summary>
            <pre>
{`API Gateway: ${process.env.NEXT_PUBLIC_API_URL || 'Not configured'}
Backend Status: ${apiStatus.backend ? '✅ Connected' : '❌ Disconnected'}

Service Status:
- Transactions: ${apiStatus.transactions ? '✅ Online' : '❌ Offline'}
- Budgets: ${apiStatus.budgets ? '✅ Online' : '❌ Not Implemented'}
- Alerts: ${apiStatus.alerts ? '✅ Online' : '❌ Not Implemented'}

Data Summary:
- Transactions: ${transactions.length}
- Total Income: ${formatCurrency(summary.totalIncome)}
- Total Expenses: ${formatCurrency(summary.totalExpenses)}
- Net Income: ${formatCurrency(summary.netIncome)}

Status:
- Loading: ${loading ? 'Yes' : 'No'}
- Error: ${error || 'None'}
- Has Loaded: ${hasLoadedRef.current ? 'Yes' : 'No'}`}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
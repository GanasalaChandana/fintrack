'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, Filter, Settings, AlertTriangle } from 'lucide-react';

const ALERTS_API = process.env.NEXT_PUBLIC_ALERTS_API_URL || 'http://localhost:8083';

interface Alert {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = filter === 'unread' ? '?unread=true' : '';
      
      const response = await fetch(`${ALERTS_API}/api/alerts${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${ALERTS_API}/api/alerts/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`${ALERTS_API}/api/alerts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await Promise.all(
        alerts.filter(a => !a.isRead).map(a => 
          fetch(`${ALERTS_API}/api/alerts/${a.id}/read`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })
        )
      );
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-400 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-400 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-400 text-blue-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'expense_limit': return '💸';
      case 'budget_limit': return '💰';
      case 'achievement': return '🎉';
      case 'unusual_activity': return '🔍';
      default: return '🚨';
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'unread') return !a.isRead;
    if (filter === 'read') return a.isRead;
    return true;
  });

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                Financial Alerts
              </h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <button
              onClick={() => setShowRules(!showRules)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Settings className="w-4 h-4" />
              Alert Rules
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md transition capitalize ${
                    filter === f
                      ? 'bg-white shadow-sm text-red-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Alert Rules Panel */}
        {showRules && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-red-500">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Alert Rules Management
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Configure automatic alerts for budget thresholds, spending limits, and unusual activity.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-900">Expense Limit Alerts</p>
                  <p className="text-sm text-red-700">Notify when daily/weekly spending exceeds thresholds</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <p className="font-medium text-orange-900">Budget Warnings</p>
                  <p className="text-sm text-orange-700">Alert when approaching 80% of budget limits</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div>
                  <p className="font-medium text-yellow-900">Unusual Activity Detection</p>
                  <p className="text-sm text-yellow-700">Detect spending patterns that deviate from normal</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-green-900">Achievement Milestones</p>
                  <p className="text-sm text-green-700">Celebrate when you reach savings goals</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading alerts...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No alerts found</p>
              <p className="text-sm text-gray-500 mt-1">You're all set! We'll notify you of important financial events.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 transition ${
                  !alert.isRead ? 'border-red-500' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{getTypeIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getPriorityColor(alert.priority)}`}>
                          {alert.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                      {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                        <div className="flex gap-3 text-xs text-gray-500 mb-2">
                          {alert.metadata.amount && <span>Amount: ${alert.metadata.amount}</span>}
                          {alert.metadata.category && <span>Category: {alert.metadata.category}</span>}
                          {alert.metadata.threshold && <span>Threshold: ${alert.metadata.threshold}</span>}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!alert.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(alert.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
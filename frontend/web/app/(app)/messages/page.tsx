'use client';

import { useState, useEffect } from 'react';
import { Mail, Check, X, Filter, Inbox } from 'lucide-react';

const NOTIFICATIONS_API = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || 'http://localhost:8086';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MessagesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id) {
        console.error('No token or user ID found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${NOTIFICATIONS_API}/api/notifications/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await fetch(`${NOTIFICATIONS_API}/api/notifications/${id}/read?userId=${user.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await fetch(`${NOTIFICATIONS_API}/api/notifications/${id}?userId=${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await fetch(`${NOTIFICATIONS_API}/api/notifications/user/${user.id}/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'welcome': return 'bg-green-100 border-green-400 text-green-800';
      case 'alert': return 'bg-red-100 border-red-400 text-red-800';
      case 'info': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'success': return 'bg-emerald-100 border-emerald-400 text-emerald-800';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'welcome': return '👋';
      case 'alert': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return '📬';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesReadFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? !n.read :
      n.read;
    
    const matchesTypeFilter = 
      typeFilter === 'all' ? true :
      n.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const availableTypes = [...new Set(notifications.map(n => n.type))];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-600" />
                Messages & Updates
              </h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['all', 'unread', 'read'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-md transition capitalize ${
                      filter === f
                        ? 'bg-white shadow-sm text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {availableTypes.length > 1 && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Type:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-3 py-1 rounded-full text-sm transition ${
                      typeFilter === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All
                  </button>
                  {availableTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1 rounded-full text-sm transition capitalize ${
                        typeFilter === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Inbox className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900">About Messages</h3>
              <p className="text-sm text-blue-700 mt-1">
                This inbox contains system updates, announcements, and general communications. 
                For financial warnings and budget alerts, check the Financial Alerts page.
              </p>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading messages...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No messages found</p>
              <p className="text-sm text-gray-500 mt-1">
                {filter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'New messages will appear here'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 transition ${
                  !notification.read ? 'border-blue-500' : 'border-gray-200 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-3xl">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border font-medium capitalize ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismiss(notification.id)}
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

        {/* Stats */}
        {!loading && notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
                <p className="text-sm text-gray-600">Unread</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</p>
                <p className="text-sm text-gray-600">Read</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
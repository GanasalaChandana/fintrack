'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  Check,
  X,
  Inbox,
  AlertCircle,
  RefreshCw,
  CheckCheck,
  Bell,
  Trash2,
} from 'lucide-react';
import { notificationService, type Notification } from '@/lib/api/services/notification.service';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadNotifications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const data = await notificationService.getAll();
      setNotifications(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      // Only show error if it's not just an empty service
      if (!err?.message?.includes('404')) {
        setError(err.message || 'Failed to load notifications');
      }
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => loadNotifications(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // Optimistic update anyway
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setActionLoading(id);
    try {
      await notificationService.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
      // Remove from UI anyway (optimistic)
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('all');
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      // Optimistic
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('Delete all notifications?')) return;
    setActionLoading('delete-all');
    try {
      await notificationService.deleteAll();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to delete all:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredNotifications = notifications.filter((n) => {
    const matchesRead =
      filter === 'all' ? true : filter === 'unread' ? !n.read : n.read;
    const matchesType =
      typeFilter === 'all' ? true : n.type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesRead && matchesType;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const availableTypes = [...new Set(notifications.map((n) => n.type).filter(Boolean))];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Mail className="w-8 h-8 text-blue-500" />
                Notifications
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {unreadCount > 0
                  ? `${unreadCount} unread · ${notifications.length} total`
                  : notifications.length > 0
                  ? 'All caught up!'
                  : 'No notifications yet'}
                {lastUpdated && (
                  <span className="ml-2 text-gray-400">
                    · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => loadNotifications(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={actionLoading === 'all'}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  {actionLoading === 'all' ? 'Marking…' : 'Mark All Read'}
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  disabled={actionLoading === 'delete-all'}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Read/Unread filter */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md text-sm transition capitalize font-medium ${
                    filter === f
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {f}
                  {f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          {availableTypes.length > 1 && (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Type:</span>
              <div className="flex flex-wrap gap-2">
                <TypeChip label="All" active={typeFilter === 'all'} onClick={() => setTypeFilter('all')} />
                {availableTypes.map((type) => (
                  <TypeChip
                    key={type}
                    label={type}
                    active={typeFilter === type}
                    onClick={() => setTypeFilter(type!)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Info banner ──────────────────────────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Inbox className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-blue-900 text-sm">About Notifications</p>
            <p className="text-sm text-blue-700 mt-0.5">
              System notifications, announcements, and account updates appear here.
              For budget alerts and spending warnings, visit{' '}
              <a href="/alerts" className="underline font-medium">Financial Alerts</a>.
            </p>
          </div>
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-900 text-sm">Failed to load notifications</p>
                <p className="text-sm text-red-700 mt-0.5">{error}</p>
                <button
                  onClick={() => loadNotifications()}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── List ─────────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {loading ? (
            <NotificationSkeleton />
          ) : filteredNotifications.length === 0 ? (
            <NotificationEmptyState filter={filter} typeFilter={typeFilter} />
          ) : (
            filteredNotifications.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                isLoading={actionLoading === n.id}
                onMarkAsRead={() => handleMarkAsRead(n.id)}
                onDismiss={() => handleDismiss(n.id)}
              />
            ))
          )}
        </div>

        {/* ── Summary ──────────────────────────────────────────────────────── */}
        {!loading && notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <SummaryItem value={notifications.length} label="Total" color="text-gray-900" />
              <SummaryItem value={unreadCount} label="Unread" color="text-blue-600" />
              <SummaryItem value={notifications.length - unreadCount} label="Read" color="text-green-600" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────

function NotificationCard({
  notification,
  isLoading,
  onMarkAsRead,
  onDismiss,
}: {
  notification: Notification;
  isLoading: boolean;
  onMarkAsRead: () => void;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`bg-white rounded-xl border-l-4 border border-gray-100 p-4 transition-all ${getTypeBorder(
        notification.type
      )} ${!notification.read ? 'shadow-sm' : 'opacity-70'} ${isLoading ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start gap-4">
        <div className="text-2xl shrink-0 mt-0.5">{getTypeEmoji(notification.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{notification.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${getTypeColor(notification.type)}`}>
              {notification.type?.toLowerCase()}
            </span>
            {!notification.read && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full font-semibold">
                NEW
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1.5 leading-relaxed">{notification.message}</p>
          <p className="text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {!notification.read && (
            <button
              onClick={onMarkAsRead}
              disabled={isLoading}
              title="Mark as read"
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onDismiss}
            disabled={isLoading}
            title="Dismiss"
            className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────

function TypeChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm transition capitalize font-medium ${
        active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function SummaryItem({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function NotificationSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function NotificationEmptyState({ filter, typeFilter }: { filter: string; typeFilter: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-700 font-medium">No notifications found</p>
      <p className="text-sm text-gray-400 mt-1">
        {filter !== 'all' || typeFilter !== 'all'
          ? 'Try adjusting your filters above.'
          : 'New notifications will appear here when they arrive.'}
      </p>
    </div>
  );
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function getTypeEmoji(type?: string): string {
  switch ((type || '').toLowerCase()) {
    case 'welcome': return '👋';
    case 'alert': return '⚠️';
    case 'success': return '✅';
    case 'warning': return '🔔';
    case 'info': return 'ℹ️';
    default: return '📬';
  }
}

function getTypeColor(type?: string): string {
  switch ((type || '').toLowerCase()) {
    case 'welcome': return 'bg-green-100 border-green-300 text-green-800';
    case 'alert': return 'bg-red-100 border-red-300 text-red-800';
    case 'success': return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'info': return 'bg-blue-100 border-blue-300 text-blue-800';
    default: return 'bg-gray-100 border-gray-300 text-gray-800';
  }
}

function getTypeBorder(type?: string): string {
  switch ((type || '').toLowerCase()) {
    case 'alert': return 'border-l-red-400';
    case 'warning': return 'border-l-yellow-400';
    case 'success': return 'border-l-green-400';
    case 'welcome': return 'border-l-blue-400';
    default: return 'border-l-gray-300';
  }
}
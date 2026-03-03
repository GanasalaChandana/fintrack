'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Check,
  X,
  Settings,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
  Target,
  RefreshCw,
  ShieldAlert,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { alertsAPI } from '@/lib/api';
import { alertService } from '@/lib/api/services/alert.service';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Alert {
  id?: string;
  userId?: string;
  title: string;
  message: string;
  type?: string;
  severity?: string;
  read: boolean;
  acknowledged?: boolean;
  createdAt?: string;
  category?: string;
  percentage?: number;
  currentSpent?: number;
  budgetAmount?: number;
}

interface AlertStats {
  total: number;
  unread: number;
  bySeverity: Record<string, number>;
  byType: Record<string, number>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EnhancedAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stats, setStats] = useState<AlertStats>({
    total: 0,
    unread: 0,
    bySeverity: {},
    byType: {},
  });
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Load alerts ─────────────────────────────────────────────────────────────

  const loadAlerts = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      // Try alertService first (typed BudgetAlert), fallback to alertsAPI
      let combined: Alert[] = [];

      try {
        const budgetAlerts = await alertService.getAlerts();
        combined = budgetAlerts.map((a) => ({
          id: a.id,
          title: buildTitle(a),
          message: buildMessage(a),
          type: a.type,
          severity: mapSeverity(a.type),
          read: a.acknowledged,
          acknowledged: a.acknowledged,
          createdAt: a.createdAt,
          category: a.category,
          percentage: a.percentage,
          currentSpent: a.currentSpent,
          budgetAmount: a.budgetAmount,
        }));
      } catch (_) {
        // fall through to generic alertsAPI
      }

      // Also try generic alertsAPI and merge (deduplicate by id)
      try {
        const generic = await alertsAPI.getAll();
        const genericArr = Array.isArray(generic) ? generic : [];
        const existingIds = new Set(combined.map((a) => a.id));
        genericArr.forEach((a: Alert) => {
          if (!existingIds.has(a.id)) combined.push(a);
        });
      } catch (_) {
        // ignore
      }

      setAlerts(combined);
      calculateStats(combined);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    loadAlerts();
    const interval = setInterval(() => loadAlerts(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Reload when filter changes (silent)
  useEffect(() => {
    if (!loading) loadAlerts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ── Stats ────────────────────────────────────────────────────────────────────

  const calculateStats = (data: Alert[]) => {
    const s: AlertStats = { total: data.length, unread: 0, bySeverity: {}, byType: {} };
    data.forEach((a) => {
      if (!a.read) s.unread++;
      const sev = (a.severity || 'low').toLowerCase();
      s.bySeverity[sev] = (s.bySeverity[sev] || 0) + 1;
      const type = a.type || 'other';
      s.byType[type] = (s.byType[type] || 0) + 1;
    });
    setStats(s);
  };

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleMarkAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      // Call real acknowledge endpoint
      await alertService.acknowledgeAlert(id);
      const updated = alerts.map((a) => (a.id === id ? { ...a, read: true, acknowledged: true } : a));
      setAlerts(updated);
      calculateStats(updated);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      // Optimistic update anyway
      const updated = alerts.map((a) => (a.id === id ? { ...a, read: true } : a));
      setAlerts(updated);
      calculateStats(updated);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (id: string) => {
    setActionLoading(id);
    try {
      // Try to acknowledge first, then remove from UI
      await alertService.acknowledgeAlert(id).catch(() => {});
      const updated = alerts.filter((a) => a.id !== id);
      setAlerts(updated);
      calculateStats(updated);
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('all');
    try {
      await alertService.acknowledgeAll();
      const updated = alerts.map((a) => ({ ...a, read: true, acknowledged: true }));
      setAlerts(updated);
      calculateStats(updated);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      // Optimistic update
      const updated = alerts.map((a) => ({ ...a, read: true }));
      setAlerts(updated);
      calculateStats(updated);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedAlerts.size === 0) return;
    setActionLoading('bulk-read');
    try {
      await Promise.allSettled(
        Array.from(selectedAlerts).map((id) => alertService.acknowledgeAlert(id))
      );
      const updated = alerts.map((a) =>
        a.id && selectedAlerts.has(a.id) ? { ...a, read: true, acknowledged: true } : a
      );
      setAlerts(updated);
      calculateStats(updated);
      setSelectedAlerts(new Set());
    } catch (err) {
      console.error('Bulk mark read failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAlerts.size === 0) return;
    if (!confirm(`Dismiss ${selectedAlerts.size} alert${selectedAlerts.size > 1 ? 's' : ''}?`)) return;
    setActionLoading('bulk-delete');
    try {
      await Promise.allSettled(
        Array.from(selectedAlerts).map((id) => alertService.acknowledgeAlert(id))
      );
      const updated = alerts.filter((a) => !a.id || !selectedAlerts.has(a.id));
      setAlerts(updated);
      calculateStats(updated);
      setSelectedAlerts(new Set());
    } catch (err) {
      console.error('Bulk delete failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Selection ────────────────────────────────────────────────────────────────

  const toggleSelect = (id: string | undefined) => {
    if (!id) return;
    const s = new Set(selectedAlerts);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedAlerts(s);
  };

  const toggleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(
        new Set(filteredAlerts.map((a) => a.id).filter((id): id is string => !!id))
      );
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return !a.read;
    if (filter === 'read') return a.read;
    return true;
  });

  const highCount = (stats.bySeverity['high'] || 0) + (stats.bySeverity['urgent'] || 0);
  const mediumCount = stats.bySeverity['medium'] || 0;
  const lowCount = stats.bySeverity['low'] || 0;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header Card ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-red-500" />
                Financial Alerts
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                {stats.unread > 0
                  ? `${stats.unread} unread alert${stats.unread > 1 ? 's' : ''} · ${stats.total} total`
                  : 'All caught up! 🎉'}
                {lastUpdated && (
                  <span className="ml-2 text-gray-400">
                    · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh */}
              <button
                onClick={() => loadAlerts(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {/* Alert Rules */}
              <button
                onClick={() => setShowRules(!showRules)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  showRules
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                Alert Rules
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="High Severity" value={highCount} color="red" icon={<ShieldAlert className="w-5 h-5" />} />
            <StatCard label="Medium Severity" value={mediumCount} color="yellow" icon={<Activity className="w-5 h-5" />} />
            <StatCard label="Low Severity" value={lowCount} color="blue" icon={<Target className="w-5 h-5" />} />
          </div>

          {/* Filter + bulk actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'unread', 'read'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-md text-sm transition capitalize font-medium ${
                    filter === f
                      ? 'bg-white shadow-sm text-red-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {f}
                  {f === 'unread' && stats.unread > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {stats.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {stats.unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  disabled={actionLoading === 'all'}
                  className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-800 font-medium disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                  {actionLoading === 'all' ? 'Marking…' : 'Mark all read'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Alert Rules Panel ─────────────────────────────────────────────── */}
        {showRules && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-gray-900">
              <Settings className="w-5 h-5 text-red-500" />
              Alert Rules
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Alerts are automatically generated when your spending hits these thresholds.
            </p>
            <div className="space-y-3">
              <AlertRuleCard title="Budget Warning at 80%" description="Medium alert when you've used 80% of a budget category" color="yellow" enabled />
              <AlertRuleCard title="Budget Exceeded (100%+)" description="High-priority alert when you exceed any budget category" color="red" enabled />
              <AlertRuleCard title="Unusual Spending" description="Detects transactions significantly above your average" color="purple" enabled />
              <AlertRuleCard title="Goal Achievements" description="Celebrate when you hit savings milestones" color="green" enabled />
            </div>
            <p className="text-xs text-gray-400 mt-4">
              ℹ️ Rules run automatically every hour on the server. You can trigger a manual refresh above.
            </p>
          </div>
        )}

        {/* ── Bulk Actions Bar ──────────────────────────────────────────────── */}
        {selectedAlerts.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-4 animate-fade-in">
            <span className="text-sm font-medium text-gray-700">
              {selectedAlerts.size} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkMarkRead}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition"
              >
                <Check className="w-3.5 h-3.5" />
                Mark Read
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Dismiss
              </button>
              <button
                onClick={() => setSelectedAlerts(new Set())}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ── Alerts List ───────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredAlerts.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              {/* Select all row */}
              <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedAlerts.size === filteredAlerts.length && filteredAlerts.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 accent-red-600"
                />
                <span className="text-sm text-gray-500">
                  Select all ({filteredAlerts.length})
                </span>
              </div>

              {filteredAlerts.map((alert) => {
                if (!alert.id) return null;
                const isLoading = actionLoading === alert.id;
                return (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    selected={selectedAlerts.has(alert.id)}
                    isLoading={isLoading}
                    onToggleSelect={() => toggleSelect(alert.id)}
                    onMarkAsRead={() => handleMarkAsRead(alert.id!)}
                    onDismiss={() => handleDismiss(alert.id!)}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────

function AlertCard({
  alert,
  selected,
  isLoading,
  onToggleSelect,
  onMarkAsRead,
  onDismiss,
}: {
  alert: Alert;
  selected: boolean;
  isLoading: boolean;
  onToggleSelect: () => void;
  onMarkAsRead: () => void;
  onDismiss: () => void;
}) {
  const borderColor = getSeverityBorder(alert.severity);
  const icon = getTypeIcon(alert.type);

  return (
    <div
      className={`bg-white rounded-xl border-l-4 border border-gray-100 p-4 transition-all ${borderColor} ${
        !alert.read ? 'shadow-sm' : 'opacity-70'
      } ${selected ? 'ring-2 ring-red-400 ring-offset-1' : ''} ${isLoading ? 'animate-pulse' : ''}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-1 w-4 h-4 rounded border-gray-300 accent-red-600"
        />

        <div className="mt-0.5 shrink-0">{icon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-gray-900 text-sm">{alert.title}</h3>
            <SeverityBadge severity={alert.severity} />
            {!alert.read && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full font-semibold tracking-wide">
                NEW
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1.5 leading-relaxed">{alert.message}</p>

          {/* Progress bar for budget alerts */}
          {alert.percentage !== undefined && alert.percentage > 0 && (
            <div className="mb-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Spent ${alert.currentSpent?.toFixed(2) ?? '0'}</span>
                <span>Budget ${alert.budgetAmount?.toFixed(2) ?? '0'}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    alert.percentage >= 100 ? 'bg-red-500' : 'bg-yellow-400'
                  }`}
                  style={{ width: `${Math.min(alert.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{alert.percentage.toFixed(0)}% of budget used</p>
            </div>
          )}

          <p className="text-xs text-gray-400">
            {alert.createdAt ? new Date(alert.createdAt).toLocaleString() : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          {!alert.read && (
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

// ─── Helper Components ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: 'red' | 'yellow' | 'blue';
  icon: React.ReactNode;
}) {
  const cls = {
    red: 'bg-red-50 text-red-700 border-red-100',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  };
  return (
    <div className={`p-4 rounded-xl border ${cls[color]}`}>
      <div className="flex items-center justify-between mb-1">
        {icon}
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity?: string }) {
  const sev = (severity || 'low').toLowerCase();
  const cls =
    sev === 'high' || sev === 'urgent'
      ? 'bg-red-100 border-red-300 text-red-800'
      : sev === 'medium'
      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
      : 'bg-blue-100 border-blue-300 text-blue-800';
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cls}`}>
      {sev.toUpperCase()}
    </span>
  );
}

function AlertRuleCard({
  title,
  description,
  color,
  enabled,
}: {
  title: string;
  description: string;
  color: 'red' | 'yellow' | 'green' | 'purple';
  enabled: boolean;
}) {
  const bg = { red: 'bg-red-50 border-red-100', yellow: 'bg-yellow-50 border-yellow-100', green: 'bg-green-50 border-green-100', purple: 'bg-purple-50 border-purple-100' };
  const text = { red: 'text-red-900', yellow: 'text-yellow-900', green: 'text-green-900', purple: 'text-purple-900' };
  const sub = { red: 'text-red-600', yellow: 'text-yellow-600', green: 'text-green-600', purple: 'text-purple-600' };
  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border ${bg[color]}`}>
      <div>
        <p className={`font-medium text-sm ${text[color]}`}>{title}</p>
        <p className={`text-xs mt-0.5 ${sub[color]}`}>{description}</p>
      </div>
      <input type="checkbox" defaultChecked={enabled} className="w-4 h-4 accent-red-600" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
          <div className="flex gap-3">
            <div className="w-4 h-4 bg-gray-200 rounded mt-1" />
            <div className="w-6 h-6 bg-gray-200 rounded-full mt-0.5" />
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

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="w-8 h-8 text-gray-300" />
      </div>
      <p className="text-gray-700 font-medium">
        {filter === 'unread' ? 'No unread alerts' : filter === 'read' ? 'No read alerts' : 'No alerts yet'}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {filter === 'all'
          ? "Alerts appear here when your spending approaches or exceeds a budget limit."
          : 'Try switching the filter above.'}
      </p>
    </div>
  );
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function buildTitle(a: { type: string; category: string }): string {
  switch (a.type) {
    case 'EXCEEDED_100': return `Budget Exceeded: ${a.category}`;
    case 'WARNING_90': return `Near Limit: ${a.category}`;
    case 'WARNING_80': return `Budget Warning: ${a.category}`;
    default: return `Alert: ${a.category}`;
  }
}

function buildMessage(a: {
  type: string;
  category: string;
  percentage: number;
  currentSpent: number;
  budgetAmount: number;
}): string {
  const pct = a.percentage.toFixed(0);
  const spent = a.currentSpent.toFixed(2);
  const budget = a.budgetAmount.toFixed(2);
  const over = (a.currentSpent - a.budgetAmount).toFixed(2);
  switch (a.type) {
    case 'EXCEEDED_100':
      return `You've exceeded your ${a.category} budget by $${over} (spent $${spent} of $${budget}).`;
    case 'WARNING_90':
      return `You've used ${pct}% of your ${a.category} budget ($${spent} of $${budget}).`;
    case 'WARNING_80':
      return `You've used ${pct}% of your ${a.category} budget ($${spent} of $${budget}).`;
    default:
      return `Spending update for ${a.category}: $${spent} of $${budget} used.`;
  }
}

function mapSeverity(type: string): string {
  if (type === 'EXCEEDED_100') return 'HIGH';
  if (type === 'WARNING_90') return 'MEDIUM';
  if (type === 'WARNING_80') return 'MEDIUM';
  return 'LOW';
}

function getSeverityBorder(severity?: string): string {
  const s = (severity || '').toLowerCase();
  if (s === 'high' || s === 'urgent') return 'border-l-red-500';
  if (s === 'medium') return 'border-l-yellow-400';
  return 'border-l-blue-400';
}

function getTypeIcon(type?: string): React.ReactNode {
  const t = (type || '').toLowerCase();
  if (t.includes('exceeded')) return <DollarSign className="w-5 h-5 text-red-500" />;
  if (t.includes('warning')) return <TrendingUp className="w-5 h-5 text-yellow-500" />;
  if (t.includes('goal') || t.includes('achievement')) return <Target className="w-5 h-5 text-green-500" />;
  if (t.includes('unusual') || t.includes('activity')) return <Activity className="w-5 h-5 text-purple-500" />;
  return <AlertTriangle className="w-5 h-5 text-gray-400" />;
}
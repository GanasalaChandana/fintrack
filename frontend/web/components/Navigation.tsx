// components/Navigation.tsx
'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Mail, LogOut, Menu, X, Check, AlertTriangle } from "lucide-react";

const ALERTS_API = process.env.NEXT_PUBLIC_ALERTS_API_URL || 'http://localhost:8083';
const NOTIFICATIONS_API = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || 'http://localhost:8086';

interface Alert {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Alerts state
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsUnreadCount, setAlertsUnreadCount] = useState(0);
  const alertsDropdownRef = useRef<HTMLDivElement>(null);
  
  // Notifications state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsUnreadCount, setNotificationsUnreadCount] = useState(0);
  const notificationsDropdownRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname() || "";

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      setHasToken(!!token);
      
      if (token) {
        loadAlerts();
        loadNotifications();
        
        // Poll every 30 seconds
        const interval = setInterval(() => {
          loadAlerts();
          loadNotifications();
        }, 30000);
        
        return () => clearInterval(interval);
      }
    }
  }, [pathname]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (alertsDropdownRef.current && !alertsDropdownRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
      if (notificationsDropdownRef.current && !notificationsDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============ ALERTS FUNCTIONS ============
  const loadAlerts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${ALERTS_API}/api/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.slice(0, 5));
        setAlertsUnreadCount(data.filter((a: Alert) => !a.isRead).length);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const handleAlertMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${ALERTS_API}/api/alerts/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, isRead: true } : a));
        setAlertsUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const handleAlertDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${ALERTS_API}/api/alerts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const dismissed = alerts.find(a => a.id === id);
        setAlerts(alerts.filter(a => a.id !== id));
        if (dismissed && !dismissed.isRead) {
          setAlertsUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'expense_limit': return '💸';
      case 'budget_limit': return '💰';
      case 'achievement': return '🎉';
      case 'unusual_activity': return '🔍';
      default: return '🚨';
    }
  };

  // ============ NOTIFICATIONS FUNCTIONS ============
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log('⚠️ No auth token, skipping notification load');
        return;
      }

      const userStr = localStorage.getItem("user");
      if (!userStr || userStr === '{}') {
        console.log('⚠️ No user data in localStorage, skipping notification load');
        return;
      }

      const user = JSON.parse(userStr);
      console.log('🔍 User from localStorage:', user);
      console.log('🔍 User ID:', user.id);

      if (!user.id) {
        console.warn('⚠️ User object exists but has no ID, skipping notification load');
        return;
      }

      console.log(`✅ Fetching notifications for user: ${user.id}`);
      const response = await fetch(`${NOTIFICATIONS_API}/api/notifications/user/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Loaded ${data.length} notifications`);
        setNotifications(data.slice(0, 5));
        setNotificationsUnreadCount(data.filter((n: Notification) => !n.read).length);
      } else {
        console.error('❌ Failed to load notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  };

  const handleNotificationMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!user.id) {
        console.error('Cannot mark notification as read: no user ID');
        return;
      }

      const response = await fetch(`${NOTIFICATIONS_API}/api/notifications/${id}/read?userId=${user.id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        setNotificationsUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleNotificationDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!user.id) {
        console.error('Cannot dismiss notification: no user ID');
        return;
      }

      const response = await fetch(`${NOTIFICATIONS_API}/api/notifications/${id}?userId=${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const dismissed = notifications.find(n => n.id === id);
        setNotifications(notifications.filter(n => n.id !== id));
        if (dismissed && !dismissed.read) {
          setNotificationsUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'welcome': return '👋';
      case 'alert': return '⚠️';
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      default: return '📬';
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const itemDate = new Date(date);
    const diffMs = now.getTime() - itemDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }
    setHasToken(false);
    router.push("/register?mode=signin");
  };

  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center">
            <span className="text-2xl font-bold">FinTrack</span>
          </div>
        </div>
      </nav>
    );
  }

  const isAuthPage = pathname === "/login" || pathname.startsWith("/register");
  if (isAuthPage) return null;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href={hasToken ? "/dashboard" : "/"} className="text-2xl font-bold text-indigo-600">
            FinTrack
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {hasToken ? (
              <>
                <Link href="/dashboard" className={`${isActive("/dashboard") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}>
                  Dashboard
                </Link>
                <Link href="/transactions" className={`${isActive("/transactions") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}>
                  Transactions
                </Link>
                <Link href="/goals-budgets" className={`${isActive("/goals-budgets") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}>
                  Goals & Budgets
                </Link>
                <Link href="/reports" className={`${isActive("/reports") ? "text-indigo-600 font-bold" : "text-gray-700"} hover:text-indigo-600`}>
                  Reports
                </Link>

                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-300">
                  
                  {/* 🚨 ALERTS BELL */}
                  <div className="relative" ref={alertsDropdownRef}>
                    <button
                      onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                      title="Financial Alerts"
                    >
                      <Bell className="w-5 h-5" />
                      {alertsUnreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                          {alertsUnreadCount > 9 ? '9+' : alertsUnreadCount}
                        </span>
                      )}
                    </button>

                    {isAlertsOpen && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Financial Alerts
                          </h3>
                          <Link href="/alerts" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium" onClick={() => setIsAlertsOpen(false)}>
                            View all
                          </Link>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {alerts.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 text-sm">No alerts</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {alerts.map((alert) => (
                                <div key={alert.id} className={`p-4 hover:bg-gray-50 transition ${!alert.isRead ? 'bg-red-50' : ''}`}>
                                  <div className="flex items-start gap-3">
                                    <div className="text-2xl">{getAlertIcon(alert.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900 truncate">{alert.title}</p>
                                        <span className={`text-xs font-semibold ${getAlertPriorityColor(alert.priority)}`}>
                                          {alert.priority.toUpperCase()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                                      <p className="text-xs text-gray-500 mt-1">{formatTime(alert.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      {!alert.isRead && (
                                        <button onClick={(e) => handleAlertMarkAsRead(alert.id, e)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Mark as read">
                                          <Check className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button onClick={(e) => handleAlertDismiss(alert.id, e)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Dismiss">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {alerts.length > 0 && (
                          <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <Link href="/alerts" className="block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium" onClick={() => setIsAlertsOpen(false)}>
                              See all alerts →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 📬 NOTIFICATIONS MAIL */}
                  <div className="relative" ref={notificationsDropdownRef}>
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                      title="Messages & Updates"
                    >
                      <Mail className="w-5 h-5" />
                      {notificationsUnreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                          {notificationsUnreadCount > 9 ? '9+' : notificationsUnreadCount}
                        </span>
                      )}
                    </button>

                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">Messages & Updates</h3>
                          <Link href="/messages" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium" onClick={() => setIsNotificationsOpen(false)}>
                            View all
                          </Link>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 text-sm">No messages</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {notifications.map((notification) => (
                                <div key={notification.id} className={`p-4 hover:bg-gray-50 transition ${!notification.read ? 'bg-blue-50' : ''}`}>
                                  <div className="flex items-start gap-3">
                                    <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                      <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      {!notification.read && (
                                        <button onClick={(e) => handleNotificationMarkAsRead(notification.id, e)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Mark as read">
                                          <Check className="w-4 h-4" />
                                        </button>
                                      )}
                                      <button onClick={(e) => handleNotificationDismiss(notification.id, e)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Dismiss">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <Link href="/messages" className="block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium" onClick={() => setIsNotificationsOpen(false)}>
                              See all messages →
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/register?mode=signin" className="text-gray-700 hover:text-indigo-600">Log In</Link>
                <Link href="/register?mode=signup" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">Sign Up</Link>
              </>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-700">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            {hasToken ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/dashboard") ? "bg-indigo-100" : ""}`}>Dashboard</Link>
                <Link href="/transactions" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/transactions") ? "bg-indigo-100" : ""}`}>Transactions</Link>
                <Link href="/goals-budgets" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/goals-budgets") ? "bg-indigo-100" : ""}`}>Goals & Budgets</Link>
                <Link href="/reports" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/reports") ? "bg-indigo-100" : ""}`}>Reports</Link>
                
                <Link href="/alerts" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/alerts") ? "bg-indigo-100" : ""} flex items-center gap-2`}>
                  <Bell className="w-4 h-4" />
                  Financial Alerts
                  {alertsUnreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{alertsUnreadCount}</span>}
                </Link>

                <Link href="/messages" onClick={() => setIsMenuOpen(false)} className={`block px-4 py-3 rounded-lg ${isActive("/messages") ? "bg-indigo-100" : ""} flex items-center gap-2`}>
                  <Mail className="w-4 h-4" />
                  Messages
                  {notificationsUnreadCount > 0 && <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{notificationsUnreadCount}</span>}
                </Link>

                <div className="pt-2 border-t border-gray-300">
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/register?mode=signin" className="block px-4 py-3">Log In</Link>
                <Link href="/register?mode=signup" className="block px-4 py-3 bg-indigo-600 text-white text-center rounded-lg">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
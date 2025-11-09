'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, X } from 'lucide-react';
import AlertsNotifications from '@/app/notifications/page';

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Transactions', path: '/transactions', icon: '💳' },
    { name: 'Budget', path: '/budget', icon: '💰' },
    { name: 'Reports', path: '/reports', icon: '📈' },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">FinTrack</span>
            </Link>
          </div>

          {/* Main nav */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions (Bell + Avatar link to settings) */}
          <div className="flex items-center gap-3">
            {/* Bell opens notifications panel (no navigation) */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Optional badge
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 grid place-items-center">4</span>
              */}
            </button>

            {/* Avatar now routes to Settings -> Profile tab */}
            <Link
              href="/settings?tab=profile"
              aria-label="Open settings"
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              U
            </Link>
          </div>
        </div>
      </div>

      {/* Notifications overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-4 top-16 bottom-4 w-[720px] max-w-[95vw] bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 h-12 border-b">
              <span className="font-semibold">Notifications</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[calc(100%-3rem)] overflow-y-auto">
              <AlertsNotifications />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

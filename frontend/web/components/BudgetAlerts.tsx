"use client";

import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { alertService, type BudgetAlert } from '@/lib/api/services/alert.service';

export function BudgetAlerts() {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);

  useEffect(() => {
    fetchAlerts();
    
    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    const newAlerts = await alertService.getAlerts();
    
    // Show toast for new alerts
    newAlerts.forEach(alert => {
      if (!alerts.find(a => a.id === alert.id)) {
        showAlertToast(alert);
      }
    });
    
    setAlerts(newAlerts);
  };

  const showAlertToast = (alert: BudgetAlert) => {
    const message = getAlertMessage(alert);
    const icon = getAlertIcon(alert.type);
    
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              {icon}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {alert.category} Budget Alert
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {message}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                ${alert.currentSpent.toFixed(2)} / ${alert.budgetAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handleAcknowledge(alert.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
          >
            Dismiss
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
      position: 'top-right',
    });
  };

  const getAlertMessage = (alert: BudgetAlert): string => {
    switch (alert.type) {
      case 'WARNING_80':
        return `You've spent ${alert.percentage.toFixed(0)}% of your budget`;
      case 'WARNING_90':
        return `You've spent ${alert.percentage.toFixed(0)}% of your budget`;
      case 'EXCEEDED_100':
        return `You've exceeded your budget by ${(alert.percentage - 100).toFixed(0)}%`;
      default:
        return 'Budget threshold reached';
    }
  };

  const getAlertIcon = (type: BudgetAlert['type']) => {
    switch (type) {
      case 'WARNING_80':
        return <AlertTriangle className="h-6 w-6 text-yellow-400" />;
      case 'WARNING_90':
        return <AlertTriangle className="h-6 w-6 text-orange-400" />;
      case 'EXCEEDED_100':
        return <XCircle className="h-6 w-6 text-red-400" />;
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    await alertService.acknowledgeAlert(alertId);
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  return <Toaster position="top-right" />;
}
// components/EmailScheduleModal.tsx
'use client';

import { useState } from 'react';
import { X, Mail, Clock, Calendar, Trash2, Plus, CheckCircle } from 'lucide-react';
import { useEmailReportStore, type EmailSchedule } from '@/lib/stores/emailReportStore';

interface EmailScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EmailScheduleModal({ isOpen, onClose }: EmailScheduleModalProps) {
  const {
    schedules,
    emailAddress,
    addSchedule,
    removeSchedule,
    toggleSchedule,
    setEmailAddress,
  } = useEmailReportStore();

  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState(emailAddress);
  const [formData, setFormData] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    reportType: 'summary' as 'transactions' | 'budgets' | 'summary',
    enabled: true,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Save email if changed
    if (email !== emailAddress) {
      setEmailAddress(email);
    }

    addSchedule(formData);

    // Reset form
    setFormData({
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '09:00',
      reportType: 'summary',
      enabled: true,
    });
    setShowForm(false);
  };

  const getScheduleDescription = (schedule: EmailSchedule) => {
    const time = schedule.time;
    let desc = '';

    switch (schedule.frequency) {
      case 'daily':
        desc = `Daily at ${time}`;
        break;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        desc = `Every ${days[schedule.dayOfWeek || 0]} at ${time}`;
        break;
      case 'monthly':
        desc = `Monthly on day ${schedule.dayOfMonth} at ${time}`;
        break;
    }

    return desc;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Email Reports
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Schedule automatic report delivery
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Email Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="summary">Summary Report</option>
                  <option value="transactions">Transactions</option>
                  <option value="budgets">Budget Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Add Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
            >
              <Plus className="w-5 h-5" />
              Add New Schedule
            </button>
          )}

          {/* Schedules List */}
          {schedules.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                No schedules yet. Create your first automated report!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`border rounded-lg p-4 transition ${
                    schedule.enabled
                      ? 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {schedule.reportType.charAt(0).toUpperCase() + schedule.reportType.slice(1)} Report
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getScheduleDescription(schedule)}
                      </p>
                      {schedule.lastSent && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Last sent: {new Date(schedule.lastSent).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSchedule(schedule.id)}
                        className={`p-2 rounded-lg transition ${
                          schedule.enabled
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        }`}
                        title={schedule.enabled ? 'Enabled' : 'Disabled'}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removeSchedule(schedule.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Reports will be sent to <strong>{email || 'your email'}</strong> at the scheduled times.
              Make sure your email is verified to receive reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
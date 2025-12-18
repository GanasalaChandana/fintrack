// lib/stores/emailReportStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmailSchedule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM format
  reportType: 'transactions' | 'budgets' | 'summary';
  enabled: boolean;
  lastSent?: string;
  createdAt: string;
}

interface EmailReportState {
  schedules: EmailSchedule[];
  emailAddress: string;
  addSchedule: (schedule: Omit<EmailSchedule, 'id' | 'createdAt'>) => void;
  removeSchedule: (id: string) => void;
  updateSchedule: (id: string, updates: Partial<EmailSchedule>) => void;
  toggleSchedule: (id: string) => void;
  setEmailAddress: (email: string) => void;
}

export const useEmailReportStore = create<EmailReportState>()(
  persist(
    (set, get) => ({
      schedules: [],
      emailAddress: '',

      addSchedule: (schedule) => {
        const newSchedule: EmailSchedule = {
          ...schedule,
          id: `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          schedules: [...state.schedules, newSchedule],
        }));
      },

      removeSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== id),
        }));
      },

      updateSchedule: (id, updates) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      toggleSchedule: (id) => {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === id ? { ...s, enabled: !s.enabled } : s
          ),
        }));
      },

      setEmailAddress: (email) => {
        set({ emailAddress: email });
      },
    }),
    {
      name: 'fintrack-email-reports',
    }
  )
);
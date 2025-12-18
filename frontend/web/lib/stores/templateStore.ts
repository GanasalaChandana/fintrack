// lib/stores/templateStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define type inline to avoid circular dependencies
interface TransactionTemplate {
  id: string;
  name: string;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  notes?: string;
  createdAt: string;
  usageCount: number;
}

interface TemplateState {
  templates: TransactionTemplate[];
  addTemplate: (template: Omit<TransactionTemplate, 'id' | 'createdAt' | 'usageCount'>) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<TransactionTemplate>) => void;
  incrementUsage: (id: string) => void;
  getTemplate: (id: string) => TransactionTemplate | undefined;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (template) => {
        const newTemplate: TransactionTemplate = {
          ...template,
          id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          usageCount: 0,
        };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));
      },

      removeTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      incrementUsage: (id) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
          ),
        }));
      },

      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id);
      },
    }),
    {
      name: 'fintrack-templates',
    }
  )
);
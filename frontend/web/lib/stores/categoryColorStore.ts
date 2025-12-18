// lib/stores/categoryColorStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CategoryColor {
  category: string;
  color: string;
  icon?: string;
}

// Default category colors
const DEFAULT_COLORS: Record<string, string> = {
  'Food & Dining': '#ef4444',
  'Shopping': '#f59e0b',
  'Transportation': '#3b82f6',
  'Bills & Utilities': '#8b5cf6',
  'Entertainment': '#ec4899',
  'Healthcare': '#10b981',
  'Travel': '#06b6d4',
  'Education': '#6366f1',
  'Personal': '#84cc16',
  'Business': '#f97316',
  'Savings': '#22c55e',
  'Income': '#14b8a6',
  'Other': '#6b7280',
};

// Predefined color palette
export const COLOR_PALETTE = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
];

interface CategoryColorState {
  colors: Record<string, CategoryColor>;
  setColor: (category: string, color: string, icon?: string) => void;
  getColor: (category: string) => string;
  resetColor: (category: string) => void;
  resetAllColors: () => void;
  getAllColors: () => CategoryColor[];
}

export const useCategoryColorStore = create<CategoryColorState>()(
  persist(
    (set, get) => ({
      colors: {},

      setColor: (category, color, icon) => {
        set((state) => ({
          colors: {
            ...state.colors,
            [category]: { category, color, icon },
          },
        }));
      },

      getColor: (category) => {
        const state = get();
        
        // Check custom colors first
        if (state.colors[category]) {
          return state.colors[category].color;
        }
        
        // Check default colors
        if (DEFAULT_COLORS[category]) {
          return DEFAULT_COLORS[category];
        }
        
        // Generate a consistent color based on category name
        const hash = category.split('').reduce((acc, char) => {
          return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        
        const colorIndex = Math.abs(hash) % COLOR_PALETTE.length;
        return COLOR_PALETTE[colorIndex];
      },

      resetColor: (category) => {
        set((state) => {
          const newColors = { ...state.colors };
          delete newColors[category];
          return { colors: newColors };
        });
      },

      resetAllColors: () => {
        set({ colors: {} });
      },

      getAllColors: () => {
        return Object.values(get().colors);
      },
    }),
    {
      name: 'fintrack-category-colors',
    }
  )
);
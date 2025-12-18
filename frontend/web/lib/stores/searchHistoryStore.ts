// lib/stores/searchHistoryStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  type: 'transaction' | 'budget' | 'category' | 'general';
  resultCount?: number;
}

interface SearchHistoryState {
  history: SearchHistoryItem[];
  maxHistory: number;
  addSearch: (query: string, type: SearchHistoryItem['type'], resultCount?: number) => void;
  removeSearch: (id: string) => void;
  clearHistory: () => void;
  getRecentSearches: (limit?: number) => SearchHistoryItem[];
  getPopularSearches: (limit?: number) => string[];
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      maxHistory: 50,

      addSearch: (query, type, resultCount) => {
        const trimmedQuery = query.trim();
        
        // Don't add empty searches
        if (!trimmedQuery) return;

        // Don't add if it's the same as the last search
        const lastSearch = get().history[0];
        if (lastSearch && lastSearch.query === trimmedQuery) return;

        const newSearch: SearchHistoryItem = {
          id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          query: trimmedQuery,
          timestamp: new Date().toISOString(),
          type,
          resultCount,
        };

        set((state) => {
          const updatedHistory = [newSearch, ...state.history];
          
          // Keep only the most recent items
          if (updatedHistory.length > state.maxHistory) {
            updatedHistory.splice(state.maxHistory);
          }

          return { history: updatedHistory };
        });
      },

      removeSearch: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      getRecentSearches: (limit = 10) => {
        return get().history.slice(0, limit);
      },

      getPopularSearches: (limit = 5) => {
        const { history } = get();
        
        // Count occurrences of each query
        const queryCounts = history.reduce((acc, item) => {
          acc[item.query] = (acc[item.query] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Sort by count and return top queries
        return Object.entries(queryCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([query]) => query);
      },
    }),
    {
      name: 'fintrack-search-history',
    }
  )
);
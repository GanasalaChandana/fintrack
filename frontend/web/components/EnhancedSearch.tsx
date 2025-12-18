// components/EnhancedSearch.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Clock, X, TrendingUp, ArrowRight } from 'lucide-react';
import { useSearchHistoryStore } from '@/lib/stores/searchHistoryStore';

interface EnhancedSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  type?: 'transaction' | 'budget' | 'category' | 'general';
}

export function EnhancedSearch({
  onSearch,
  placeholder = 'Search transactions...',
  type = 'transaction',
}: EnhancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    addSearch,
    removeSearch,
    clearHistory,
    getRecentSearches,
    getPopularSearches,
  } = useSearchHistoryStore();

  const recentSearches = getRecentSearches(5);
  const popularSearches = getPopularSearches(3);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    addSearch(trimmedQuery, type);
    onSearch(trimmedQuery);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleSelectHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all search history?')) {
      clearHistory();
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder={placeholder}
            data-search-input
            className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </form>

      {/* Search Dropdown */}
      {showDropdown && (recentSearches.length > 0 || popularSearches.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-[400px] overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              <div>
                {recentSearches.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectHistory(item.query)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {item.query}
                      </span>
                      {item.resultCount !== undefined && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.resultCount} results
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSearch(item.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {popularSearches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                <TrendingUp className="w-3 h-3" />
                Popular Searches
              </div>
              <div>
                {popularSearches.map((popularQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectHistory(popularQuery)}
                    className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {popularQuery}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {recentSearches.length === 0 && popularSearches.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No search history yet. Start searching to see suggestions here.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
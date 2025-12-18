// components/QuickFilters.tsx
'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { getDateRange, formatDateRange, type DateRange } from '@/lib/utils/dateFilters';

interface QuickFiltersProps {
  onFilterChange: (range: DateRange) => void;
  activeFilter?: string;
}

export function QuickFilters({ onFilterChange, activeFilter = 'this-month' }: QuickFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(activeFilter);

  const filters = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this-week', label: 'This Week' },
    { id: 'last-week', label: 'Last Week' },
    { id: 'this-month', label: 'This Month' },
    { id: 'last-month', label: 'Last Month' },
    { id: 'last-30-days', label: 'Last 30 Days' },
    { id: 'last-90-days', label: 'Last 90 Days' },
    { id: 'this-year', label: 'This Year' },
    { id: 'last-year', label: 'Last Year' },
    { id: 'all-time', label: 'All Time' },
  ];

  const handleFilterClick = (filterId: string) => {
    setSelected(filterId);
    const range = getDateRange(filterId);
    onFilterChange(range);
    setIsOpen(false);
  };

  const selectedFilter = filters.find((f) => f.id === selected);
  const dateRange = getDateRange(selected);

  return (
    <div className="relative">
      {/* Desktop - Horizontal Buttons */}
      <div className="hidden lg:flex items-center gap-2 flex-wrap">
        {filters.slice(0, 6).map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterClick(filter.id)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition
              ${
                selected === filter.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {filter.label}
          </button>
        ))}
        
        {/* More Filters Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            More
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 min-w-[200px]">
                {filters.slice(6).map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterClick(filter.id)}
                    className={`
                      w-full text-left px-4 py-2 text-sm transition
                      ${
                        selected === filter.id
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile - Single Dropdown */}
      <div className="lg:hidden relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div className="text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedFilter?.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDateRange(dateRange.start, dateRange.end)}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20 max-h-[400px] overflow-y-auto">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter.id)}
                  className={`
                    w-full text-left px-4 py-3 transition
                    ${
                      selected === filter.id
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="font-medium">{filter.label}</div>
                  {selected === filter.id && (
                    <div className="text-xs opacity-75 mt-1">
                      {formatDateRange(getDateRange(filter.id).start, getDateRange(filter.id).end)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { Search, Filter, X, Calendar, Tag, DollarSign } from "lucide-react";

interface FilterOptions {
  search: string;
  type: "all" | "income" | "expense";
  category: string;
  dateFrom: string;
  dateTo: string;
  amountMin: number;
  amountMax: number;
}

interface SearchAndFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
}

export function SearchAndFilters({ onFilterChange, categories }: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    type: "all",
    category: "",
    dateFrom: "",
    dateTo: "",
    amountMin: 0,
    amountMax: 0,
  });

  const updateFilters = (updates: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const cleared: FilterOptions = {
      search: "",
      type: "all",
      category: "",
      dateFrom: "",
      dateTo: "",
      amountMin: 0,
      amountMax: 0,
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  const activeFilterCount = [
    filters.type !== "all",
    filters.category !== "",
    filters.dateFrom !== "",
    filters.dateTo !== "",
    filters.amountMin > 0,
    filters.amountMax > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            placeholder="Search transactions..."
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative rounded-lg border-2 px-4 py-3 font-semibold transition-colors ${
            showFilters || activeFilterCount > 0
              ? "border-blue-600 bg-blue-50 text-blue-600"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="animate-slide-down rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value as any })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilters({ dateTo: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Amount Min */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Min Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.amountMin || ""}
                onChange={(e) => updateFilters({ amountMin: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="0.00"
              />
            </div>

            {/* Amount Max */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Max Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={filters.amountMax || ""}
                onChange={(e) => updateFilters({ amountMax: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="rounded-lg border-2 border-gray-300 px-4 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
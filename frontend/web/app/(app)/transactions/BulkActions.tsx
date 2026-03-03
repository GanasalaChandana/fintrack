'use client';

import React, { useState } from 'react';
import {
  Trash2,
  Tag,
  Download,
  Copy,
  X,
  Check,
  FileSpreadsheet,
  FileText,
  ChevronDown,
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => Promise<void>;
  onBulkCategorize: (category: string) => Promise<void>;
  onBulkExport: (format: 'csv' | 'excel' | 'pdf') => Promise<void>;
  onBulkDuplicate: () => void;
  onClearSelection: () => void;
}

type CategoryId =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "health"
  | "income"
  | "other";

interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
}

const CATEGORIES: Category[] = [
  {
    id: "food",
    name: "Food & Dining",
    icon: "🍔",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  {
    id: "transport",
    name: "Transportation",
    icon: "🚗",
    badgeBg: "bg-purple-100",
    badgeText: "text-purple-700",
  },
  {
    id: "shopping",
    name: "Shopping",
    icon: "🛍️",
    badgeBg: "bg-pink-100",
    badgeText: "text-pink-700",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    icon: "🎮",
    badgeBg: "bg-orange-100",
    badgeText: "text-orange-700",
  },
  {
    id: "bills",
    name: "Bills & Utilities",
    icon: "💡",
    badgeBg: "bg-green-100",
    badgeText: "text-green-700",
  },
  {
    id: "health",
    name: "Healthcare",
    icon: "⚕️",
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
  },
  {
    id: "income",
    name: "Income",
    icon: "💰",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  {
    id: "other",
    name: "Other",
    icon: "📦",
    badgeBg: "bg-gray-100",
    badgeText: "text-gray-700",
  },
];

export function BulkActions({
  selectedCount,
  onBulkDelete,
  onBulkCategorize,
  onBulkExport,
  onBulkDuplicate,
  onClearSelection,
}: BulkActionsProps) {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedCount} transaction${selectedCount > 1 ? 's' : ''}?`)) {
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkDelete();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategorize = async (categoryId: string) => {
    setIsProcessing(true);
    try {
      await onBulkCategorize(categoryId);
      setShowCategoryModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setIsProcessing(true);
    try {
      await onBulkExport(format);
      setShowExportMenu(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <>
      {/* Bulk Actions Bar - Matches your current design */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left side - Selection count */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {selectedCount} transaction{selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Deselect All */}
            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Deselect All
            </button>

            {/* Categorize */}
            <button
              onClick={() => setShowCategoryModal(true)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Categorize</span>
            </button>

            {/* Export Menu */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Export as CSV</div>
                      <div className="text-xs text-gray-500">Comma-separated values</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('excel')}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Export as Excel</div>
                      <div className="text-xs text-gray-500">Formatted spreadsheet</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">Export as PDF</div>
                      <div className="text-xs text-gray-500">Printable document</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Duplicate - only enabled for single selection */}
            <button
              onClick={onBulkDuplicate}
              disabled={isProcessing || selectedCount !== 1}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              title={selectedCount !== 1 ? "Select exactly one transaction to duplicate" : "Duplicate transaction"}
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Duplicate</span>
            </button>

            {/* Delete Selected */}
            <button
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Selected</span>
                  <span className="sm:hidden">Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border-2 border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b-2 border-gray-200 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Change Category
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Select a category for {selectedCount} transaction{selectedCount > 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                disabled={isProcessing}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorize(category.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <span className="text-3xl">{category.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                        {category.name}
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${category.badgeBg} ${category.badgeText}`}>
                      {category.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white px-6 py-4 border-t-2 border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                disabled={isProcessing}
                className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close export menu */}
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </>
  );
}
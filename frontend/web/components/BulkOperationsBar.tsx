// components/BulkOperationsBar.tsx
'use client';

import { Trash2, Edit, Download, X, Check } from 'lucide-react';

interface BulkOperationsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onEdit: () => void;
  onExport: () => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  totalCount: number;
}

export function BulkOperationsBar({
  selectedCount,
  onDelete,
  onEdit,
  onExport,
  onSelectAll,
  onClearSelection,
  totalCount,
}: BulkOperationsBarProps) {
  if (selectedCount === 0) return null;

  const isAllSelected = selectedCount === totalCount;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-slideUp">
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {selectedCount} selected
            </span>
          </div>

          {!isAllSelected && (
            <button
              onClick={onSelectAll}
              className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
            >
              Select all {totalCount}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition font-medium"
            title="Edit selected"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition font-medium"
            title="Export selected"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition font-medium"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600" />

        {/* Close */}
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          title="Clear selection"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
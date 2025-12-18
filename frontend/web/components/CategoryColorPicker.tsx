// components/CategoryColorPicker.tsx
'use client';

import { useState } from 'react';
import { X, Check, RotateCcw, Palette } from 'lucide-react';
import { useCategoryColorStore, COLOR_PALETTE } from '@/lib/stores/categoryColorStore';

interface CategoryColorPickerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
}

export function CategoryColorPicker({ isOpen, onClose, categories }: CategoryColorPickerProps) {
  const { colors, setColor, getColor, resetColor, resetAllColors } = useCategoryColorStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleColorSelect = (color: string) => {
    if (selectedCategory) {
      setColor(selectedCategory, color);
      setSelectedCategory(null);
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset all category colors to defaults?')) {
      resetAllColors();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Category Colors
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customize colors for your categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const currentColor = getColor(category);
              const isSelected = selectedCategory === category;

              return (
                <div
                  key={category}
                  className={`border rounded-lg p-4 transition cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg shadow-sm"
                        style={{ backgroundColor: currentColor }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {category}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {currentColor}
                        </div>
                      </div>
                    </div>
                    {colors[category] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetColor(category);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Reset to default"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isSelected && (
                    <div className="grid grid-cols-8 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      {COLOR_PALETTE.map((color) => (
                        <button
                          key={color}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleColorSelect(color);
                          }}
                          className="w-8 h-8 rounded-lg shadow-sm hover:scale-110 transition relative"
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {currentColor === color && (
                            <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <Palette className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                No categories yet. Create some transactions to see categories here.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Palette className="w-4 h-4" />
            <p>
              Click on a category to change its color. Colors will be used in charts and reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
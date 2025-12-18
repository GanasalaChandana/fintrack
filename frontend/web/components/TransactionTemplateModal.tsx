// components/TransactionTemplateModal.tsx
'use client';

import { useState } from 'react';
import { X, Save, Trash2, Plus, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { useTemplateStore } from '@/lib/stores/templateStore';

// Define the type here if not in @/types
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

interface TransactionTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseTemplate?: (template: TransactionTemplate) => void;
}

export function TransactionTemplateModal({
  isOpen,
  onClose,
  onUseTemplate,
}: TransactionTemplateModalProps) {
  const { templates, addTemplate, removeTemplate, incrementUsage } = useTemplateStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    category: '',
    notes: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTemplate({
      name: formData.name,
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      notes: formData.notes,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      amount: '',
      type: 'EXPENSE',
      category: '',
      notes: '',
    });
    setShowCreateForm(false);
  };

  const handleUseTemplate = (template: TransactionTemplate) => {
    incrementUsage(template.id);
    onUseTemplate?.(template);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Transaction Templates
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Save frequent transactions as templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showCreateForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Rent, Grocery Shopping"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Housing, Food, Salary"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Template
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <Plus className="w-5 h-5" />
                Create New Template
              </button>

              {templates.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No templates yet. Create your first template to save time!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {template.type === 'INCOME' ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            )}
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                          </div>
                          {template.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            ${template.amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Used {template.usageCount}x</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {template.category}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                        >
                          Use Template
                        </button>
                        <button
                          onClick={() => removeTemplate(template.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
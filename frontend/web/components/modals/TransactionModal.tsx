"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Tag, FileText, TrendingUp, TrendingDown } from "lucide-react";

interface Transaction {
  id?: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  merchant: string;
  description: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => Promise<void>;
  transaction?: Transaction | null;
  mode?: "add" | "edit";
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  mode = "add",
}: TransactionModalProps) {
  const [formData, setFormData] = useState<Transaction>({
    type: "expense",
    category: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    merchant: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (transaction && mode === "edit") {
      setFormData(transaction);
    } else if (mode === "add") {
      setFormData({
        type: "expense",
        category: "",
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        merchant: "",
        description: "",
      });
    }
  }, [transaction, mode, isOpen]);

  const categories = {
    expense: ["Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Healthcare", "Other"],
    income: ["Salary", "Freelance", "Investment", "Business", "Gift", "Other"],
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.merchant.trim()) newErrors.merchant = "Merchant is required";
    if (formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.date) newErrors.date = "Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save transaction:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "edit" ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Type Toggle */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                className={`flex items-center justify-center gap-2 rounded-xl p-4 font-semibold transition-all ${
                  formData.type === "expense"
                    ? "bg-red-100 text-red-700 ring-2 ring-red-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <TrendingDown className="h-5 w-5" />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                className={`flex items-center justify-center gap-2 rounded-xl p-4 font-semibold transition-all ${
                  formData.type === "income"
                    ? "bg-green-100 text-green-700 ring-2 ring-green-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                Income
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Merchant */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Merchant / Source
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.merchant}
                  onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                  className={`w-full rounded-lg border ${
                    errors.merchant ? "border-red-300" : "border-gray-300"
                  } py-3 pl-10 pr-4 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="e.g., Starbucks, Salary"
                />
              </div>
              {errors.merchant && (
                <p className="mt-1 text-sm text-red-600">{errors.merchant}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount || ""}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className={`w-full rounded-lg border ${
                    errors.amount ? "border-red-300" : "border-gray-300"
                  } py-3 pl-8 pr-4 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full appearance-none rounded-lg border ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  } py-3 pl-10 pr-10 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  <option value="">Select a category</option>
                  {categories[formData.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full rounded-lg border ${
                    errors.date ? "border-red-300" : "border-gray-300"
                  } py-3 pl-10 pr-4 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
              {errors.date && (
                <p className="mt-1 text-sm text-red-600">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Add any notes about this transaction..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-gray-300 px-6 py-2.5 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : mode === "edit" ? "Update" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

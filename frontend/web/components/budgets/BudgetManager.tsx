// components/budgets/BudgetManager.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Plus, X, Edit2, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

export interface Budget {
  id: string;          // BudgetsPage normalizes id to String(...)
  category: string;
  budget: number;      // limit
  spent: number;
  icon: string;
  color: string;
}

interface BudgetManagerProps {
  budgets: Budget[];
  onAddBudget: (budget: Omit<Budget, "id" | "spent">) => void;
  onUpdateBudget: (id: Budget["id"], budget: Partial<Budget>) => void;
  onDeleteBudget: (id: Budget["id"]) => void;
}

type Mode = "add" | "edit";

interface FormState {
  category: string;
  budget: string; // keep as string for input; convert to number on submit
  icon: string;
  color: string;
}

export function BudgetManager({
  budgets,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}: BudgetManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("add");
  const [editingId, setEditingId] = useState<Budget["id"] | null>(null);
  const [form, setForm] = useState<FormState>({
    category: "",
    budget: "",
    icon: "💰",
    color: "#3b82f6",
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const remaining = totalBudget - totalSpent;
    return { totalBudget, totalSpent, remaining };
  }, [budgets]);

  const openAddModal = () => {
    setMode("add");
    setEditingId(null);
    setForm({
      category: "",
      budget: "",
      icon: "💰",
      color: "#3b82f6",
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (budget: Budget) => {
    setMode("edit");
    setEditingId(budget.id);
    setForm({
      category: budget.category,
      budget: String(budget.budget),
      icon: budget.icon,
      color: budget.color,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validate = (f: FormState): Partial<FormState> => {
    const e: Partial<FormState> = {};
    if (!f.category.trim()) e.category = "Category is required";
    if (!f.budget.trim() || isNaN(Number(f.budget)) || Number(f.budget) <= 0) {
      e.budget = "Enter a valid positive amount";
    }
    if (!f.icon.trim()) e.icon = "Icon is required";
    if (!f.color.trim()) e.color = "Color is required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eMap = validate(form);
    setErrors(eMap);
    if (Object.keys(eMap).length > 0) return;

    const payload: Omit<Budget, "id" | "spent"> = {
      category: form.category.trim(),
      budget: Number(form.budget),
      icon: form.icon.trim() || "💰",
      color: form.color,
    };

    if (mode === "add") {
      onAddBudget(payload);
    } else if (mode === "edit" && editingId != null) {
      onUpdateBudget(editingId, payload);
    }

    setIsModalOpen(false);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  // ---------- Empty state ----------

  if (!budgets || budgets.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <EmptyState
          icon={Plus}
          title="No budgets yet"
          description="Create your first budget to start tracking your spending and goals."
          actionLabel="Add Budget"
          onAction={openAddModal}
          gradient="from-indigo-500 to-purple-500"
        />

        {isModalOpen && (
          <BudgetModal
            mode={mode}
            form={form}
            errors={errors}
            onChange={setForm}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    );
  }

  // ---------- Main UI ----------

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Goals &amp; Budgets
            </h1>
            <p className="text-gray-600">
              Track your spending limits and see how you’re doing this month.
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SummaryCard
            label="Total Budget"
            value={formatCurrency(totals.totalBudget)}
          />
          <SummaryCard
            label="Total Spent"
            value={formatCurrency(totals.totalSpent)}
          />
          <SummaryCard
            label="Remaining"
            value={formatCurrency(totals.remaining)}
            highlight={totals.remaining < 0}
          />
        </div>

        {/* Budget cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b) => {
            const percent =
              b.budget === 0 ? 0 : Math.min((b.spent / b.budget) * 100, 130);
            const over = b.spent > b.budget;

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${b.color}1a` }} // 10% opacity
                    >
                      {b.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {b.category}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Limit {formatCurrency(b.budget)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition"
                      aria-label="Edit budget"
                    >
                      <Edit2 className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => onDeleteBudget(b.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition"
                      aria-label="Delete budget"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-500">
                      Spent {formatCurrency(b.spent)}
                    </span>
                    <span
                      className={
                        over ? "text-red-600 font-semibold" : "text-gray-500"
                      }
                    >
                      {over
                        ? `Over by ${formatCurrency(b.spent - b.budget)}`
                        : `${Math.round(
                            (b.budget === 0 ? 0 : (b.spent / b.budget) * 100)
                          )}% of budget`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        over ? "bg-red-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <BudgetModal
          mode={mode}
          form={form}
          errors={errors}
          onChange={setForm}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

/* ---------- Small subcomponents ---------- */

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p
        className={`text-xl font-bold ${
          highlight ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface BudgetModalProps {
  mode: Mode;
  form: FormState;
  errors: Partial<FormState>;
  onChange: (form: FormState) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function BudgetModal({
  mode,
  form,
  errors,
  onChange,
  onClose,
  onSubmit,
}: BudgetModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === "add" ? "Add Budget" : "Edit Budget"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={form.category}
              onChange={(e) =>
                onChange({ ...form, category: e.target.value })
              }
              placeholder="e.g., Groceries"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Limit
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.budget}
              onChange={(e) => onChange({ ...form, budget: e.target.value })}
              placeholder="e.g., 300"
              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
            />
            {errors.budget && (
              <p className="mt-1 text-xs text-red-600">{errors.budget}</p>
            )}
          </div>

          <div className="grid grid-cols-[80px,1fr] gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <input
                type="text"
                maxLength={2}
                value={form.icon}
                onChange={(e) => onChange({ ...form, icon: e.target.value })}
                className="w-full text-center rounded-lg border-2 border-gray-200 px-2 py-2 text-lg focus:border-indigo-500 outline-none"
              />
              {errors.icon && (
                <p className="mt-1 text-xs text-red-600">{errors.icon}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) =>
                    onChange({ ...form, color: e.target.value })
                  }
                  className="w-10 h-10 rounded-md border border-gray-200"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) =>
                    onChange({ ...form, color: e.target.value })
                  }
                  className="flex-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 outline-none"
                />
              </div>
              {errors.color && (
                <p className="mt-1 text-xs text-red-600">{errors.color}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {mode === "add" ? "Add Budget" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  PiggyBank,
  Home,
  Car,
  Plane,
  Heart,
  Wallet,
  Loader2,
  TrendingUp,
} from "lucide-react";

import { useRouter } from "next/navigation";

type TabKey = "goals" | "budgets";
type GoalIconKey =
  | "piggybank"
  | "plane"
  | "car"
  | "home"
  | "heart"
  | "graduation"
  | "wallet";

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  icon: GoalIconKey;
  color: string;
  category: string;
  monthlyContribution: number;
}

interface Budget {
  id: string;
  category: string;
  budget: number;
  spent: number;
  icon: string;
  color: string;
}

interface NewGoalForm {
  name: string;
  target: string;
  current: string;
  deadline: string;
  icon: GoalIconKey;
  color: string;
  monthlyContribution: string;
}

interface NewBudgetForm {
  category: string;
  budget: string;
  icon: string;
  color: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ft_token") || localStorage.getItem("authToken");
};

const apiRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("ft_token");
      localStorage.removeItem("authToken");
      window.location.href = "/register?mode=signin";
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return {} as T;
  }

  return response.json();
};

const iconMap: Record<GoalIconKey, typeof PiggyBank> = {
  piggybank: PiggyBank,
  plane: Plane,
  car: Car,
  home: Home,
  heart: Heart,
  graduation: TrendingUp, // using TrendingUp as the graduation icon
  wallet: Wallet,
};

const colorOptions = [
  { value: "from-green-500 to-green-600", label: "Green" },
  { value: "from-blue-500 to-blue-600", label: "Blue" },
  { value: "from-purple-500 to-purple-600", label: "Purple" },
  { value: "from-orange-500 to-orange-600", label: "Orange" },
  { value: "from-pink-500 to-pink-600", label: "Pink" },
  { value: "from-red-500 to-red-600", label: "Red" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const calculateProgress = (current: number, target: number) =>
  target <= 0 ? 0 : Math.min((current / target) * 100, 100);

const calculateMonthsRemaining = (deadline: string) => {
  const now = new Date();
  const end = new Date(deadline);
  const diffMs = end.getTime() - now.getTime();
  const months = Math.round(diffMs / (1000 * 60 * 60 * 24 * 30));
  return Math.max(months, 0);
};

const GoalCard: React.FC<{
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}> = ({ goal, onEdit, onDelete }) => {
  const iconKey = (goal.icon in iconMap ? goal.icon : "piggybank") as GoalIconKey;
  const Icon = iconMap[iconKey];

  const progress = calculateProgress(goal.current, goal.target);
  const remaining = Math.max(goal.target - goal.current, 0);
  const monthsLeft = calculateMonthsRemaining(goal.deadline);
  const neededPerMonth = monthsLeft === 0 ? Infinity : remaining / monthsLeft;
  const onTrack = monthsLeft > 0 && neededPerMonth <= goal.monthlyContribution;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{goal.name}</h3>
            <p className="text-sm text-gray-500">
              {monthsLeft} months remaining
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-2xl font-bold text-gray-900">
            {formatCurrency(goal.current)}
          </span>
          <span className="text-sm text-gray-600">
            of {formatCurrency(goal.target)}
          </span>
        </div>

        <div className="relative">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500 shadow-sm`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
            <span className="text-xs font-bold text-gray-700">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Remaining</div>
            <div className="font-bold text-gray-900">
              {formatCurrency(remaining)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Monthly Goal</div>
            <div className="font-bold text-gray-900">
              {formatCurrency(goal.monthlyContribution)}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            onTrack ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {onTrack ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm font-semibold">
                On track to reach goal!
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {monthsLeft === 0
                  ? "Past deadline"
                  : `Need ${formatCurrency(neededPerMonth)}/month`}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const BudgetCard: React.FC<{
  budget: Budget;
  onEdit: (budget: Budget) => void;
}> = ({ budget, onEdit }) => {
  const percentage =
    budget.budget <= 0 ? 0 : (budget.spent / budget.budget) * 100;
  const remaining = Math.max(budget.budget - budget.spent, 0);
  const isOverBudget = budget.spent > budget.budget;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-5 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{budget.icon}</div>
          <div>
            <h3 className="font-bold text-gray-900">{budget.category}</h3>
            <p className="text-xs text-gray-500">Monthly Budget</p>
          </div>
        </div>
        <button
          onClick={() => onEdit(budget)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-baseline">
          <span
            className={`text-xl font-bold ${
              isOverBudget ? "text-red-600" : "text-gray-900"
            }`}
          >
            {formatCurrency(budget.spent)}
          </span>
          <span className="text-sm text-gray-600">
            of {formatCurrency(budget.budget)}
          </span>
        </div>

        <div className="relative">
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: isOverBudget
                  ? "#ef4444"
                  : percentage > 80
                  ? "#f59e0b"
                  : budget.color,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div
            className={`text-sm font-semibold ${
              isOverBudget
                ? "text-red-600"
                : remaining < budget.budget * 0.2
                ? "text-amber-600"
                : "text-green-600"
            }`}
          >
            {isOverBudget ? (
              <span>
                Over by{" "}
                {formatCurrency(Math.abs(budget.budget - budget.spent))}
              </span>
            ) : (
              <span>{formatCurrency(remaining)} left</span>
            )}
          </div>
          <div className="text-sm font-bold text-gray-600">
            {Math.round(percentage)}%
          </div>
        </div>

        {percentage > 80 && (
          <div
            className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
              isOverBudget ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            <span>
              {isOverBudget ? "Budget exceeded!" : "Approaching budget limit"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const GoalModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSave: (goal: NewGoalForm) => Promise<void>;
  editingGoal?: Goal | null;
}> = ({ show, onClose, onSave, editingGoal }) => {
  const [formData, setFormData] = useState<NewGoalForm>({
    name: "",
    target: "",
    current: "",
    deadline: "",
    icon: "piggybank" as GoalIconKey,
    color: colorOptions[0].value,
    monthlyContribution: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        name: editingGoal.name,
        target: String(editingGoal.target),
        current: String(editingGoal.current),
        deadline: editingGoal.deadline,
        icon: editingGoal.icon,
        color: editingGoal.color,
        monthlyContribution: String(editingGoal.monthlyContribution),
      });
    } else {
      setFormData({
        name: "",
        target: "",
        current: "",
        deadline: "",
        icon: "piggybank",
        color: colorOptions[0].value,
        monthlyContribution: "",
      });
    }
  }, [editingGoal, show]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.target || !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      alert("Failed to save goal");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingGoal ? "Edit Goal" : "Create New Goal"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Emergency Fund"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Amount *
              </label>
              <input
                type="number"
                placeholder="10000"
                value={formData.target}
                onChange={(e) =>
                  setFormData({ ...formData, target: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Amount
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.current}
                onChange={(e) =>
                  setFormData({ ...formData, current: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Date *
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <input
              type="number"
              placeholder="500"
              value={formData.monthlyContribution}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  monthlyContribution: e.target.value,
                })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Choose Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(iconMap) as GoalIconKey[]).map((key) => {
                const Icon = iconMap[key];
                return (
                  <button
                    key={key}
                    onClick={() => setFormData({ ...formData, icon: key })}
                    className={`p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all ${
                      formData.icon === key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Icon className="w-6 h-6 text-gray-700 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setFormData({ ...formData, color: option.value })
                  }
                  className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    formData.color === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BudgetModal: React.FC<{
  show: boolean;
  onClose: () => void;
  onSave: (budget: NewBudgetForm) => Promise<void>;
  editingBudget?: Budget | null;
}> = ({ show, onClose, onSave, editingBudget }) => {
  const [formData, setFormData] = useState<NewBudgetForm>({
    category: "",
    budget: "",
    icon: "💰",
    color: "#3b82f6",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category: editingBudget.category,
        budget: String(editingBudget.budget),
        icon: editingBudget.icon,
        color: editingBudget.color,
      });
    } else {
      setFormData({
        category: "",
        budget: "",
        icon: "💰",
        color: "#3b82f6",
      });
    }
  }, [editingBudget, show]);

  const handleSubmit = async () => {
    if (!formData.category || !formData.budget) {
      alert("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch {
      alert("Failed to save budget");
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingBudget ? "Edit Budget" : "Add New Budget"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Food & Dining"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Monthly Budget *
            </label>
            <input
              type="number"
              placeholder="1000"
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Icon (Emoji)
            </label>
            <input
              type="text"
              placeholder="💰"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center text-2xl"
              maxLength={2}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              className="w-full h-12 border-2 border-gray-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : editingBudget ? "Update Budget" : "Add Budget"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function GoalsBudgetManager() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("goals");
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      if (!token) {
        router.replace("/register?mode=signin");
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
      fetchBudgets();
    }
  }, [isAuthenticated]);

  const fetchGoals = async () => {
    setLoadingData(true);
    try {
      const data = await apiRequest<Goal[]>("/api/goals", { method: "GET" });
      setGoals(data);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
      setGoals([]);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBudgets = async () => {
    try {
      const data = await apiRequest<Budget[]>("/api/budgets", { method: "GET" });
      setBudgets(data);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
      setBudgets([]);
    }
  };

  const handleSaveGoal = async (formData: NewGoalForm) => {
    const goalData = {
      name: formData.name,
      target: parseFloat(formData.target),
      current: parseFloat(formData.current || "0"),
      deadline: formData.deadline,
      icon: formData.icon,
      color: formData.color,
      category: formData.name.toLowerCase().replace(/\s+/g, "-"),
      monthlyContribution: parseFloat(formData.monthlyContribution || "0"),
    };

    if (editingGoal) {
      await apiRequest(`/api/goals/${editingGoal.id}`, {
        method: "PUT",
        body: JSON.stringify(goalData),
      });
    } else {
      await apiRequest("/api/goals", {
        method: "POST",
        body: JSON.stringify(goalData),
      });
    }

    await fetchGoals();
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await apiRequest(`/api/goals/${id}`, { method: "DELETE" });
      await fetchGoals();
    } catch {
      alert("Failed to delete goal");
    }
  };

  const handleSaveBudget = async (formData: NewBudgetForm) => {
    const budgetData = {
      category: formData.category,
      budget: parseFloat(formData.budget),
      spent: 0,
      icon: formData.icon,
      color: formData.color,
    };

    if (editingBudget) {
      await apiRequest(`/api/budgets/${editingBudget.id}`, {
        method: "PUT",
        body: JSON.stringify(budgetData),
      });
    } else {
      await apiRequest("/api/budgets", {
        method: "POST",
        body: JSON.stringify(budgetData),
      });
    }

    await fetchBudgets();
    setEditingBudget(null);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetPercentage =
    totalBudget <= 0 ? 0 : (totalSpent / totalBudget) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                Goals & Budgets
              </h1>
              <p className="text-gray-600">
                Track your financial goals and manage spending
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "goals"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Target className="w-5 h-5" />
              Savings Goals
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {goals.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("budgets")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "budgets"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Wallet className="w-5 h-5" />
              Monthly Budgets
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                {budgets.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "goals" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Total Goals Progress
                  </h2>
                  <p className="text-blue-100">
                    You&apos;re making great progress!
                  </p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <Target className="w-8 h-8" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-blue-100 text-sm mb-1">Total Saved</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(
                      goals.reduce((sum, g) => sum + g.current, 0)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-blue-100 text-sm mb-1">Total Target</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(
                      goals.reduce((sum, g) => sum + g.target, 0)
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-blue-100 text-sm mb-1">
                    Average Progress
                  </div>
                  <div className="text-3xl font-bold">
                    {goals.length > 0
                      ? Math.round(
                          goals.reduce(
                            (sum, g) =>
                              sum +
                              calculateProgress(g.current, g.target),
                            0
                          ) / goals.length
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setEditingGoal(null);
                setShowGoalModal(true);
              }}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Goal
            </button>

            {loadingData ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Loading goals...</p>
              </div>
            ) : goals.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No goals yet
                </h3>
                <p className="text-gray-600">
                  Create your first savings goal to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={(g) => {
                      setEditingGoal(g);
                      setShowGoalModal(true);
                    }}
                    onDelete={handleDeleteGoal}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "budgets" && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Monthly Budget Overview
                  </h2>
                  <p className="text-gray-600">November 2025</p>
                </div>
                <button
                  onClick={() => {
                    setEditingBudget(null);
                    setShowBudgetModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Budget
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="text-blue-600 text-sm font-medium mb-2">
                    Total Budget
                  </div>
                  <div className="text-3xl font-bold text-blue-900">
                    {formatCurrency(totalBudget)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="text-purple-600 text-sm font-medium mb-2">
                    Total Spent
                  </div>
                  <div className="text-3xl font-bold text-purple-900">
                    {formatCurrency(totalSpent)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <div className="text-green-600 text-sm font-medium mb-2">
                    Remaining
                  </div>
                  <div className="text-3xl font-bold text-green-900">
                    {formatCurrency(Math.max(totalBudget - totalSpent, 0))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Overall Budget Usage</span>
                  <span className="font-bold">
                    {Math.round(budgetPercentage)}%
                  </span>
                </div>
              </div>
            </div>

            {budgets.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No budgets set
                </h3>
                <p className="text-gray-600">
                  Add your first budget category to start tracking spending!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((b) => (
                  <BudgetCard
                    key={b.id}
                    budget={b}
                    onEdit={(budget) => {
                      setEditingBudget(budget);
                      setShowBudgetModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <GoalModal
        show={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      <BudgetModal
        show={showBudgetModal}
        onClose={() => {
          setShowBudgetModal(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        editingBudget={editingBudget}
      />
    </div>
  );
}

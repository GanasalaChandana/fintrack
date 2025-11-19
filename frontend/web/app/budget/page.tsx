"use client";
import { useRouter } from 'next/navigation';
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
  GraduationCap,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/* ===================== Types ===================== */

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
  id: number;
  name: string;
  target: number;
  current: number;
  deadline: string; // ISO date string
  icon: GoalIconKey;
  color: string; // tailwind gradient classes e.g. "from-green-500 to-green-600"
  category: string;
  monthlyContribution: number;
}

interface Budget {
  id: number;
  category: string;
  budget: number;
  spent: number;
  icon: string; // emoji
  color: string; // hex or tailwind-compatible color for bars
}

interface GoalCardProps {
  goal: Goal;
}

interface BudgetCardProps {
  budget: Budget;
}

/* ===================== Data / Maps ===================== */

const iconMap: Record<GoalIconKey, LucideIcon> = {
  piggybank: PiggyBank,
  plane: Plane,
  car: Car,
  home: Home,
  heart: Heart,
  graduation: GraduationCap,
  wallet: Wallet,
};

/* ===================== Utils ===================== */

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

/* ===================== Page ===================== */

const GoalsBudgetManager: React.FC = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<TabKey>("goals");
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showBudgetModal, setShowBudgetModal] = useState<boolean>(false);

  // Auth check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('ft_token');
      
      if (!token) {
        router.replace('/register?mode=signin');
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }
  }, [router]);

  // ---- Mock data (typed) ----
  const [goals] = useState<Goal[]>([
    {
      id: 1,
      name: "Emergency Fund",
      target: 10000,
      current: 7500,
      deadline: "2025-12-31",
      icon: "piggybank",
      color: "from-green-500 to-green-600",
      category: "savings",
      monthlyContribution: 500,
    },
    {
      id: 2,
      name: "Dream Vacation",
      target: 5000,
      current: 2800,
      deadline: "2026-06-30",
      icon: "plane",
      color: "from-blue-500 to-blue-600",
      category: "travel",
      monthlyContribution: 300,
    },
    {
      id: 3,
      name: "New Car Down Payment",
      target: 15000,
      current: 8900,
      deadline: "2026-03-31",
      icon: "car",
      color: "from-purple-500 to-purple-600",
      category: "vehicle",
      monthlyContribution: 600,
    },
    {
      id: 4,
      name: "Home Renovation",
      target: 20000,
      current: 3400,
      deadline: "2027-01-01",
      icon: "home",
      color: "from-orange-500 to-orange-600",
      category: "home",
      monthlyContribution: 400,
    },
  ]);

  const [budgets] = useState<Budget[]>([
    { id: 1, category: "Food & Dining", budget: 800, spent: 920, icon: "🍔", color: "#3b82f6" },
    { id: 2, category: "Transportation", budget: 400, spent: 320, icon: "🚗", color: "#8b5cf6" },
    { id: 3, category: "Shopping", budget: 500, spent: 480, icon: "🛍️", color: "#ec4899" },
    { id: 4, category: "Entertainment", budget: 300, spent: 180, icon: "🎮", color: "#f59e0b" },
    { id: 5, category: "Bills & Utilities", budget: 600, spent: 580, icon: "💡", color: "#10b981" },
    { id: 6, category: "Healthcare", budget: 200, spent: 120, icon: "⚕️", color: "#ef4444" },
  ]);

  /* ---------- Small Cards ---------- */

  const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
    const Icon = iconMap[goal.icon];
    const progress = calculateProgress(goal.current, goal.target);
    const remaining = Math.max(goal.target - goal.current, 0);
    const monthsLeft = calculateMonthsRemaining(goal.deadline);
    const neededPerMonth = monthsLeft === 0 ? Infinity : remaining / monthsLeft;
    const onTrack = monthsLeft > 0 && neededPerMonth <= goal.monthlyContribution;

    return (
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${goal.color} rounded-xl flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{goal.name}</h3>
              <p className="text-sm text-gray-500">{monthsLeft} months remaining</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(goal.current)}</span>
            <span className="text-sm text-gray-600">of {formatCurrency(goal.target)}</span>
          </div>

          <div className="relative">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${goal.color} rounded-full transition-all duration-500 shadow-sm`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
              <span className="text-xs font-bold text-gray-700">{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Remaining</div>
              <div className="font-bold text-gray-900">{formatCurrency(remaining)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Monthly Goal</div>
              <div className="font-bold text-gray-900">{formatCurrency(goal.monthlyContribution)}</div>
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
                <span className="text-sm font-semibold">On track to reach goal!</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">
                  {monthsLeft === 0 ? "Past deadline" : `Need ${formatCurrency(neededPerMonth)}/month`}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
    const percentage = budget.budget <= 0 ? 0 : (budget.spent / budget.budget) * 100;
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
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <span className={`text-xl font-bold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
              {formatCurrency(budget.spent)}
            </span>
            <span className="text-sm text-gray-600">of {formatCurrency(budget.budget)}</span>
          </div>

          <div className="relative">
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: isOverBudget ? "#ef4444" : percentage > 80 ? "#f59e0b" : budget.color,
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div
              className={`text-sm font-semibold ${
                isOverBudget ? "text-red-600" : remaining < budget.budget * 0.2 ? "text-amber-600" : "text-green-600"
              }`}
            >
              {isOverBudget ? (
                <span>Over by {formatCurrency(Math.abs(budget.budget - budget.spent))}</span>
              ) : (
                <span>{formatCurrency(remaining)} left</span>
              )}
            </div>
            <div className="text-sm font-bold text-gray-600">{Math.round(percentage)}%</div>
          </div>

          {percentage > 80 && (
            <div
              className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${
                isOverBudget ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              <span>{isOverBudget ? "Budget exceeded!" : "Approaching budget limit"}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const GoalModal: React.FC = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Goal</h2>
          <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Name</label>
            <input
              type="text"
              placeholder="e.g., Emergency Fund"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Target Amount</label>
              <input
                type="number"
                placeholder="10000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Amount</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Target Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Choose Icon</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(iconMap) as GoalIconKey[]).map((key) => {
                const Icon = iconMap[key];
                return (
                  <button key={key} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <Icon className="w-6 h-6 text-gray-700 mx-auto" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowGoalModal(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg">
              Create Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Aggregates
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const budgetPercentage = totalBudget <= 0 ? 0 : (totalSpent / totalBudget) * 100;

  // Show loading while checking auth
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Goals & Budgets</h1>
              <p className="text-gray-600">Track your financial goals and manage spending</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("goals")}
              className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors ${
                activeTab === "goals" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
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
                activeTab === "budgets" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600 hover:text-gray-900"
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "goals" && (
          <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Total Goals Progress</h2>
                  <p className="text-blue-100">You're making great progress!</p>
                </div>
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-8 h-8" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-blue-100 text-sm mb-1">Total Saved</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(goals.reduce((sum, g) => sum + g.current, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-blue-100 text-sm mb-1">Total Target</div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(goals.reduce((sum, g) => sum + g.target, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-blue-100 text-sm mb-1">Average Progress</div>
                  <div className="text-3xl font-bold">
                    {Math.round(
                      goals.reduce((sum, g) => sum + calculateProgress(g.current, g.target), 0) / goals.length
                    )}
                    %
                  </div>
                </div>
              </div>
            </div>

            {/* Add Goal Button */}
            <button
              onClick={() => setShowGoalModal(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Goal
            </button>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "budgets" && (
          <div className="space-y-8">
            {/* Budget Summary */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Monthly Budget Overview</h2>
                  <p className="text-gray-600">November 2025</p>
                </div>
                <button
                  onClick={() => setShowBudgetModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  Add Budget
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                  <div className="text-blue-600 text-sm font-medium mb-2">Total Budget</div>
                  <div className="text-3xl font-bold text-blue-900">{formatCurrency(totalBudget)}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="text-purple-600 text-sm font-medium mb-2">Total Spent</div>
                  <div className="text-3xl font-bold text-purple-900">{formatCurrency(totalSpent)}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6">
                  <div className="text-green-600 text-sm font-medium mb-2">Remaining</div>
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
                  <span className="font-bold">{Math.round(budgetPercentage)}%</span>
                </div>
              </div>
            </div>

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((b) => (
                <BudgetCard key={b.id} budget={b} />
              ))}
            </div>
          </div>
        )}
      </main>

      {showGoalModal && <GoalModal />}
    </div>
  );
};

export default GoalsBudgetManager;
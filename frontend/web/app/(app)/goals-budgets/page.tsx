"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BudgetManager, type Budget } from "@/components/budgets/BudgetManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ft_token") || localStorage.getItem("authToken");
};

const getUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userId");
};

const apiRequest = async <T,>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const userId = getUserId();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(userId && { "X-User-Id": userId }),
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("ft_token");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      window.location.href = "/register?mode=signin";
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (
    response.status === 204 ||
    response.status === 200 && response.headers.get("content-length") === "0"
  ) {
    return {} as T;
  }

  return response.json();
};

// Expanded CATEGORY_MAP — maps canonical budget category names to transaction
// aliases so spending is correctly counted regardless of label variation.
const CATEGORY_MAP: Record<string, string[]> = {
  "Food & Dining":     ["food & dining", "food", "dining", "restaurant", "eating out"],
  Transportation:      ["transportation", "transport", "uber", "lyft", "taxi", "gas", "fuel"],
  Shopping:            ["shopping", "clothes", "clothing", "retail"],
  Entertainment:       ["entertainment", "movies", "cinema", "games", "gaming", "subscriptions"],
  "Bills & Utilities": ["bills & utilities", "bills", "utilities", "electricity", "water", "internet", "phone"],
  Healthcare:          ["healthcare", "health", "medical", "doctor", "pharmacy", "dentist"],
  Groceries:           ["groceries", "grocery", "supermarket", "food & grocery"],
  Education:           ["education", "school", "tuition", "books", "course", "training"],
  Travel:              ["travel", "flights", "hotel", "vacation", "airbnb", "trip"],
  "Personal Care":     ["personal care", "beauty", "salon", "spa", "haircut", "grooming"],
  Savings:             ["savings", "saving", "investment", "401k", "ira"],
  Income:              ["income", "salary", "paycheck", "wages", "revenue"],
  Other:               ["other", "miscellaneous", "misc"],
};

/**
 * Returns true if a transaction's category matches the budget's category.
 * Matching is case-insensitive and alias-aware.
 */
const categoryMatches = (budgetCategory: string, txCategory: string): boolean => {
  const budgetLower = budgetCategory.toLowerCase().trim();
  const txLower = txCategory.toLowerCase().trim();

  if (budgetLower === txLower) return true;

  for (const aliases of Object.values(CATEGORY_MAP)) {
    const normalizedAliases = aliases.map((a) => a.toLowerCase());
    if (
      normalizedAliases.includes(budgetLower) &&
      normalizedAliases.includes(txLower)
    ) {
      return true;
    }
  }

  return false;
};

// Compute the current calendar month in LOCAL time, not UTC.
const getLocalYearMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export default function BudgetsPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      const userId = getUserId();

      if (!token || !userId) {
        router.replace("/register?mode=signin");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [router]);

  const fetchBudgets = useCallback(
    async (options: { silent?: boolean } = {}): Promise<void> => {
      if (!options.silent) setIsLoading(true);
      else setIsFetching(true);

      try {
        const [rawBudgets, transactions] = await Promise.all([
          apiRequest<any[]>("/api/budgets", { method: "GET" }),
          apiRequest<any[]>("/api/transactions", { method: "GET" }).catch(
            () => [] as any[]
          ),
        ]);

        const allExpenses = Array.isArray(transactions)
          ? transactions.filter(
              (t: any) => t.type === "expense" || t.type === "EXPENSE"
            )
          : [];

        const activeMonth = getLocalYearMonth();

        const validBudgets = rawBudgets.filter(
          (b: any) =>
            b.category &&
            typeof b.category === "string" &&
            b.category.trim().length > 0 &&
            Number(b.budget ?? b.limit ?? b.amount ?? 0) > 0
        );

        const normalized = validBudgets.map((b: any) => {
          const budgetAmount = Number(b.budget ?? b.limit ?? b.amount ?? 0);

          const spent = allExpenses
            .filter(
              (t: any) =>
                (t.date ?? "").slice(0, 7) === activeMonth &&
                categoryMatches(b.category, t.category ?? "")
            )
            .reduce(
              (sum: number, t: any) => sum + Math.abs(Number(t.amount ?? 0)),
              0
            );

          return {
            id: String(b.id),
            category: b.category,
            budget: budgetAmount,
            spent: Math.round(spent * 100) / 100,
            icon: b.icon || "💰",
            color: b.color || "#3b82f6",
          } as Budget;
        });

        setBudgets(normalized);
      } catch (error) {
        console.error("Failed to fetch budgets:", error);
        setBudgets([]);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      void fetchBudgets();
    }
  }, [isAuthenticated, fetchBudgets]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddBudget = async (
    budgetData: Omit<Budget, "id" | "spent">
  ): Promise<void> => {
    const currentMonth = getLocalYearMonth();
    await apiRequest("/api/budgets", {
      method: "POST",
      body: JSON.stringify({
        category: budgetData.category,
        budget:   budgetData.budget,
        icon:     budgetData.icon  || "💰",
        color:    budgetData.color || "#3b82f6",
        spent:    0,
        month:    currentMonth,
      }),
    });
    await fetchBudgets({ silent: true });
  };

  const handleUpdateBudget = async (
    id: Budget["id"],
    updates: Partial<Budget>
  ): Promise<void> => {
    const existing = budgets.find((b) => b.id === id);

    // Only send fields the backend entity expects.
    // Never include id (String vs Long mismatch), spent, createdAt, updatedAt —
    // those cause Jackson deserialization errors and a 500 response.
    await apiRequest(`/api/budgets/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        category: updates.category ?? existing?.category,
        budget:   updates.budget   ?? existing?.budget,
        icon:     updates.icon     ?? existing?.icon    ?? "💰",
        color:    updates.color    ?? existing?.color   ?? "#3b82f6",
      }),
    });

    await fetchBudgets({ silent: true });
  };

  const handleDeleteBudget = async (id: Budget["id"]): Promise<void> => {
    await apiRequest(`/api/budgets/${id}`, {
      method: "DELETE",
    });
    await fetchBudgets({ silent: true });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading your budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Subtle top-bar spinner during background re-fetches */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-indigo-100 overflow-hidden">
          <div className="h-full bg-indigo-500 animate-pulse w-full" />
        </div>
      )}
      <BudgetManager
        budgets={budgets}
        onAddBudget={handleAddBudget}
        onUpdateBudget={handleUpdateBudget}
        onDeleteBudget={handleDeleteBudget}
      />
    </>
  );
}
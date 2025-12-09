"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BudgetManager, type Budget } from "@/components/budgets/BudgetManager";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ft_token") || localStorage.getItem("authToken");
};

// Helper to get user ID from localStorage
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
      ...(userId && { "X-User-Id": userId }), // ✅ Add X-User-Id header
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
    response.headers.get("content-length") === "0"
  ) {
    return {} as T;
  }

  return response.json();
};

export default function BudgetsPage() {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  // ---- Auth check ----
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = getToken();
      const userId = getUserId();
      
      if (!token || !userId) {
        router.replace("/register?mode=signin");
      } else {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    }
  }, [router]);

  // ---- Fetch budgets once authenticated ----
  useEffect(() => {
    if (isAuthenticated) {
      void fetchBudgets();
    }
  }, [isAuthenticated]);

  const fetchBudgets = async (): Promise<void> => {
    try {
      const data = await apiRequest<Budget[]>("/api/budgets", {
        method: "GET",
      });

      // If your backend sends id as number/string, keep it consistent
      const normalized = data.map((b: any) => ({
        ...b,
        id: String(b.id),
      })) as Budget[];

      setBudgets(normalized);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
      setBudgets([]);
    }
  };

  const handleAddBudget = (budgetData: Omit<Budget, "id" | "spent">): void => {
    (async () => {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        await apiRequest("/api/budgets", {
          method: "POST",
          body: JSON.stringify({
            ...budgetData,
            spent: 0,
            month: currentMonth,
            icon: budgetData.icon || "💰",
            color: budgetData.color || "#3b82f6"
          }),
        });
        await fetchBudgets();
      } catch (error) {
        console.error("Failed to add budget:", error);
      }
    })();
  };

  const handleUpdateBudget = (
    id: Budget["id"],
    updates: Partial<Budget>
  ): void => {
    (async () => {
      try {
        await apiRequest(`/api/budgets/${id}`, {
          method: "PUT",
          body: JSON.stringify(updates),
        });
        await fetchBudgets();
      } catch (error) {
        console.error("Failed to update budget:", error);
      }
    })();
  };

  const handleDeleteBudget = (id: Budget["id"]): void => {
    (async () => {
      try {
        await apiRequest(`/api/budgets/${id}`, {
          method: "DELETE",
        });
        await fetchBudgets();
      } catch (error) {
        console.error("Failed to delete budget:", error);
      }
    })();
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

  return (
    <BudgetManager
      budgets={budgets}
      onAddBudget={handleAddBudget}
      onUpdateBudget={handleUpdateBudget}
      onDeleteBudget={handleDeleteBudget}
    />
  );
}
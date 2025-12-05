// frontend/web/lib/api/services/transaction.service.ts
import api from "@/lib/api";

// ✅ Match your Java enum exactly
export type BackendTxType = "INCOME" | "EXPENSE";

export interface Transaction {
  id?: string;
  userId?: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  type: BackendTxType;
  recurring?: boolean;
  createdAt?: string;
  updatedAt?: string;

  // optional frontend-only information (backend may ignore it)
  merchant?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  transactionCount: number;
  period: string;
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: BackendTxType;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  size?: number;
}

function buildSearchParams(filters?: TransactionFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();

  const {
    startDate,
    endDate,
    category,
    type,
    minAmount,
    maxAmount,
    page,
    size,
  } = filters;

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (category) params.append("category", category);
  if (type) params.append("type", type);
  if (minAmount !== undefined) params.append("minAmount", String(minAmount));
  if (maxAmount !== undefined) params.append("maxAmount", String(maxAmount));
  if (page !== undefined) params.append("page", String(page));
  if (size !== undefined) params.append("size", String(size));

  return params.toString();
}

// ⚠️ IMPORTANT: Use the SAME endpoint that works from the Dashboard.
// If Dashboard’s network tab shows POST /transactions (no /api),
// keep BASE_PATH = "/transactions".
const BASE_PATH = "/api/transactions"; // change to "/transactions" if that’s what works

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const qs = buildSearchParams(filters);
    const endpoint = qs ? `${BASE_PATH}?${qs}` : BASE_PATH;

    console.log("📡 GET", endpoint);

    const res = (await api.get(endpoint)) as unknown;

    if (Array.isArray(res)) return res as Transaction[];
    if (res && Array.isArray((res as any).content)) {
      return (res as any).content as Transaction[];
    }
    if (res && Array.isArray((res as any).data)) {
      return (res as any).data as Transaction[];
    }

    return [];
  },

  async getById(id: string): Promise<Transaction> {
    const endpoint = `${BASE_PATH}/${id}`;
    console.log("📡 GET", endpoint);
    const res = (await api.get(endpoint)) as unknown as Transaction;
    return res;
  },

  async create(
    tx: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): Promise<Transaction> {
    console.log("📤 POST", BASE_PATH, tx);
    const res = (await api.post(
      BASE_PATH,
      tx,
    )) as unknown as Transaction;
    console.log("📥 POST response:", res);
    return res;
  },

  async update(
    id: string,
    updates: Partial<Transaction>,
  ): Promise<Transaction> {
    const endpoint = `${BASE_PATH}/${id}`;
    console.log("✏️ PUT", endpoint, updates);
    const res = (await api.put(
      endpoint,
      updates,
    )) as unknown as Transaction;
    return res;
  },

  async delete(id: string): Promise<void> {
    const endpoint = `${BASE_PATH}/${id}`;
    console.log("🗑️ DELETE", endpoint);
    await api.delete(endpoint);
  },

  async getSummary(
    filters?: Pick<TransactionFilters, "startDate" | "endDate">,
  ): Promise<TransactionSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append("startDate", filters.startDate);
      if (filters?.endDate) params.append("endDate", filters.endDate);

      const endpoint = params.toString()
        ? `${BASE_PATH}/summary?${params}`
        : `${BASE_PATH}/summary`;

      console.log("📡 GET", endpoint);

      const res = (await api.get(endpoint)) as
        | TransactionSummary
        | undefined;

      return (
        res ?? {
          totalIncome: 0,
          totalExpenses: 0,
          netIncome: 0,
          transactionCount: 0,
          period: "N/A",
        }
      );
    } catch (e) {
      console.error("❌ Failed to fetch transaction summary:", e);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        transactionCount: 0,
        period: "N/A",
      };
    }
  },

  async classify(
    description: string,
  ): Promise<{ category: string; confidence: number }> {
    try {
      const endpoint = `${BASE_PATH}/classify`;
      console.log("📤 POST", endpoint, { description });
      const res = (await api.post(endpoint, {
        description,
      })) as unknown as {
        category: string;
        confidence: number;
      };
      return res;
    } catch (e) {
      console.error("❌ Failed to classify transaction:", e);
      return { category: "Uncategorized", confidence: 0 };
    }
  },

  async exportCsv(filters?: TransactionFilters): Promise<Blob> {
    const qs = buildSearchParams(filters);
    const endpoint = qs
      ? `${BASE_PATH}/export?${qs}`
      : `${BASE_PATH}/export`;

    const base =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("authToken") ||
          localStorage.getItem("ft_token")
        : "";

    console.log("📡 CSV GET", `${base}${endpoint}`);

    const res = await fetch(`${base}${endpoint}`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok) throw new Error("Failed to export transactions");
    return await res.blob();
  },
};

export const transactionsAPI = transactionService;
export type { Transaction as ApiTransaction };

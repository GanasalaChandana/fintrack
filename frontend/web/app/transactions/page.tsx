// app/transactions/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Edit2, Trash2, Filter, Download, RefreshCw, X } from 'lucide-react';
import { transactionService } from '@/lib/api/services/transaction.service';

/* -------- Local UI types (decoupled from service typings) -------- */
type TxType = 'INCOME' | 'EXPENSE';

interface UiTransaction {
  id?: string | number;
  date: string;            // YYYY-MM-DD
  description: string;
  merchant?: string;
  category?: string;
  type: TxType;
  amount: number;          // positive number; we render +/- by type
}

interface UiTransactionFilter {
  type?: TxType;
  category?: string;
  search?: string;         // matches description or merchant
}

/* -------- Small helpers -------- */
const CATEGORIES = [
  'Food', 'Shopping', 'Entertainment', 'Utilities', 'Transportation',
  'Healthcare', 'Education', 'Income', 'Other'
];

function normalizeTx(raw: any): UiTransaction {
  // Defensive normalization from whatever backend returns
  return {
    id: raw?.id ?? raw?.transactionId ?? undefined,
    date: (raw?.date ?? '').toString().slice(0, 10),
    description: raw?.description ?? '',
    merchant: raw?.merchant ?? '',
    category: raw?.category ?? '',
    type: (raw?.type === 'INCOME' ? 'INCOME' : 'EXPENSE') as TxType,
    amount: typeof raw?.amount === 'number' ? raw.amount : Number(raw?.amount ?? 0),
  };
}

function toCSV(rows: UiTransaction[]): string {
  const header = ['Date', 'Description', 'Merchant', 'Category', 'Type', 'Amount'];
  const lines = rows.map(r => [
    r.date,
    (r.description ?? '').replaceAll('"', '""'),
    (r.merchant ?? '').replaceAll('"', '""'),
    (r.category ?? '').replaceAll('"', '""'),
    r.type,
    r.amount.toFixed(2),
  ].map(v => `"${v}"`).join(','));
  return [header.join(','), ...lines].join('\r\n');
}

const TransactionsPage: React.FC = () => {
  const [allTransactions, setAllTransactions] = useState<UiTransaction[]>([]);
  const [transactions, setTransactions] = useState<UiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<UiTransaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState<UiTransaction>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    merchant: '',
    category: '',
    type: 'EXPENSE',
    amount: 0,
  });

  const [filters, setFilters] = useState<UiTransactionFilter>({});

  // Derived filter function (memoized)
  const filtered = useMemo(() => {
    const q = (filters.search ?? '').trim().toLowerCase();
    return (list: UiTransaction[]) =>
      list.filter(tx => {
        if (filters.type && tx.type !== filters.type) return false;
        if (filters.category && (tx.category ?? '') !== filters.category) return false;
        if (q) {
          const hay = `${tx.description ?? ''} ${tx.merchant ?? ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
  }, [filters]);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAll(); // no .filter() on service
      const normalized: UiTransaction[] = Array.isArray(data) ? data.map(normalizeTx) : [];
      setAllTransactions(normalized);
      setTransactions(filtered(normalized));
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err?.message ?? 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply filters whenever they change
  useEffect(() => {
    setTransactions(filtered(allTransactions));
  }, [filters, allTransactions, filtered]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      merchant: '',
      category: '',
      type: 'EXPENSE',
      amount: 0,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingTransaction?.id != null) {
        await transactionService.update(String(editingTransaction.id), formData as any);

      } else {
        await transactionService.create(formData as any);
      }
      await fetchTransactions();
      setShowAddModal(false);
      setEditingTransaction(null);
      resetForm();
    } catch (err: any) {
      alert(err?.message ?? 'Failed to save transaction');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await transactionService.delete(id as any);
      await fetchTransactions();
    } catch (err: any) {
      alert(err?.message ?? 'Failed to delete transaction');
    }
  };

  const handleEdit = (tx: UiTransaction) => {
    setEditingTransaction(tx);
    setFormData({
      id: tx.id,
      date: tx.date ?? new Date().toISOString().split('T')[0],
      description: tx.description ?? '',
      merchant: tx.merchant ?? '',
      category: tx.category ?? '',
      type: tx.type ?? 'EXPENSE',
      amount: typeof tx.amount === 'number' ? tx.amount : 0,
    });
    setShowAddModal(true);
  };

  const applyFilters = () => {
    setTransactions(filtered(allTransactions));
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setShowFilters(false);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const data = filtered(allTransactions);

      if (format === 'csv') {
        const csv = toCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        return;
      }

      // excel (xlsx) via dynamic import; falls back to csv if lib missing
      try {
        const XLSX = await import('xlsx');
        const sheet = XLSX.utils.json_to_sheet(
          data.map(d => ({
            Date: d.date,
            Description: d.description,
            Merchant: d.merchant ?? '',
            Category: d.category ?? '',
            Type: d.type,
            Amount: d.amount,
          }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, 'Transactions');
        const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } catch {
        // fallback to CSV if xlsx not available
        const csv = toCSV(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err: any) {
      alert(err?.message ?? 'Failed to export transactions');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-1">Manage and track all your financial transactions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => { resetForm(); setEditingTransaction(null); setShowAddModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusCircle className="w-4 h-4" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Filter Transactions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type ?? ''}
                  onChange={(e) => setFilters({ ...filters, type: (e.target.value || undefined) as TxType | undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category ?? ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={filters.search ?? ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
                  placeholder="Search description or merchant"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={String(tx.id ?? `${tx.date}-${tx.description}`)} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.merchant ?? '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                        {tx.category ?? '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                        tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleEdit(tx)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {tx.id != null && (
                        <button
                          onClick={() => handleDelete(tx.id!)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                </h2>
                <button onClick={() => { setShowAddModal(false); setEditingTransaction(null); resetForm(); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Grocery shopping"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                  <input
                    type="text"
                    value={formData.merchant ?? ''}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Whole Foods"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category ?? ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TxType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={Number.isFinite(formData.amount) ? Math.abs(formData.amount) : 0}
                    onChange={(e) => {
                      const n = parseFloat(e.target.value);
                      setFormData({ ...formData, amount: Number.isFinite(n) ? n : 0 });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowAddModal(false); setEditingTransaction(null); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;

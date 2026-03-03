'use client';

import React, { useState, useMemo } from 'react';
import { BulkActions } from './BulkActions';
import { transactionsAPI } from '@/lib/api';

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  merchant?: string;
  category: string;
  date: string;
  type: 'income' | 'expense';
  recurring?: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'completed' | 'pending';
  paymentMethod: string;
  tags?: string[];
  aiSuggested?: boolean;
}

interface EnhancedTransactionTableProps {
  transactions: Transaction[];
  onUpdate: () => void;
  renderTable: (
    transactions: Transaction[],
    selectedTransactions: string[],
    onToggleSelect: (id: string) => void,
    onToggleSelectAll: (checked: boolean) => void
  ) => React.ReactNode;
}

type CategoryId =
  | "food"
  | "transport"
  | "shopping"
  | "entertainment"
  | "bills"
  | "health"
  | "income"
  | "other";

const mapCategoryToBackend = (
  category: CategoryId,
  type: 'income' | 'expense',
): string => {
  if (type === 'income') return 'Income';

  const map: Record<CategoryId, string> = {
    food: 'Food & Dining',
    transport: 'Transportation',
    shopping: 'Shopping',
    entertainment: 'Entertainment',
    bills: 'Bills & Utilities',
    health: 'Healthcare',
    income: 'Income',
    other: 'Other',
  };
  return map[category] || 'Other';
};

const mapCategoryToUI = (category: string): CategoryId => {
  const map: Record<string, CategoryId> = {
    'Food & Dining': 'food',
    'Transportation': 'transport',
    'Shopping': 'shopping',
    'Entertainment': 'entertainment',
    'Bills & Utilities': 'bills',
    'Healthcare': 'health',
    'Income': 'income',
    'Salary': 'income',
    'Freelance': 'income',
    'Business': 'income',
    'Investment': 'income',
  };
  return map[category] || 'other';
};

export function EnhancedTransactionTable({
  transactions,
  onUpdate,
  renderTable,
}: EnhancedTransactionTableProps) {
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [showToast, setShowToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const toast = (type: 'success' | 'error' | 'info', message: string) => {
    setShowToast({ type, message });
    setTimeout(() => setShowToast(null), 4000);
  };

  const selectedTransactionObjects = useMemo(() => {
    return transactions.filter(t => selectedTransactions.includes(t.id));
  }, [transactions, selectedTransactions]);

  const handleToggleSelect = (id: string) => {
    setSelectedTransactions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (checked: boolean) => {
    setSelectedTransactions(checked ? transactions.map(t => t.id) : []);
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedTransactions.map(id => transactionsAPI.delete(id))
      );
      toast('success', `Deleted ${selectedTransactions.length} transactions`);
      setSelectedTransactions([]);
      onUpdate();
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast('error', 'Failed to delete transactions');
    }
  };

  const handleBulkCategorize = async (categoryId: string) => {
    try {
      // Update each transaction with the new category
      await Promise.all(
        selectedTransactionObjects.map(async (transaction) => {
          const backendCategory = mapCategoryToBackend(
            categoryId as CategoryId,
            transaction.type
          );
          
          return transactionsAPI.update(transaction.id, {
            date: transaction.date,
            description: transaction.description,
            category: backendCategory,
            amount: transaction.amount,
            type: transaction.type,
          });
        })
      );

      toast('success', `Updated category for ${selectedTransactions.length} transactions`);
      setSelectedTransactions([]);
      onUpdate();
    } catch (err) {
      console.error('Bulk categorize error:', err);
      toast('error', 'Failed to update categories');
    }
  };

  const handleBulkExport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const exportTransactions = selectedTransactionObjects;
      const today = new Date().toISOString().split('T')[0];

      if (format === 'csv') {
        // CSV Export
        const headers = 'Date,Merchant,Description,Category,Amount,Type,Payment Method,Status';
        const rows = exportTransactions.map(t => {
          const amount = Math.abs(t.amount).toFixed(2);
          return `"${t.date}","${t.merchant || 'Unknown'}","${t.description}","${t.category}","${amount}","${t.type}","${t.paymentMethod}","${t.status}"`;
        });
        
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-selected-${today}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast('success', `Exported ${exportTransactions.length} transactions as CSV`);
      } else if (format === 'excel') {
        // Excel Export
        const rows = exportTransactions.map((t, i) => {
          const amount = Math.abs(t.amount).toFixed(2);
          const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
          const color = t.type === 'income' ? '#059669' : '#dc2626';
          
          return `<tr style="background:${bg}">
            <td style="padding:7px;border:1px solid #e5e7eb">${t.date}</td>
            <td style="padding:7px;border:1px solid #e5e7eb">${t.merchant || 'Unknown'}</td>
            <td style="padding:7px;border:1px solid #e5e7eb">${t.description}</td>
            <td style="padding:7px;border:1px solid #e5e7eb">${t.category}</td>
            <td style="padding:7px;border:1px solid #e5e7eb;color:${color};font-weight:bold;text-align:right">
              ${t.type === 'income' ? '+' : '-'}$${amount}
            </td>
            <td style="padding:7px;border:1px solid #e5e7eb">${t.type}</td>
            <td style="padding:7px;border:1px solid #e5e7eb">${t.paymentMethod}</td>
            <td style="padding:7px;border:1px solid #e5e7eb;text-align:center">${t.status}</td>
          </tr>`;
        }).join('');
        
        const html = `
          <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
          <head><meta charset="utf-8"></head>
          <body>
            <h1 style="color:#1e40af">FinTrack Transaction Report (Selected)</h1>
            <p>Generated: ${new Date().toLocaleDateString()} | Total: ${exportTransactions.length} transactions</p>
            <table border="1" cellspacing="0" style="border-collapse:collapse;width:100%">
              <thead>
                <tr style="background:#1e40af;color:white">
                  <th style="padding:10px">Date</th>
                  <th style="padding:10px">Merchant</th>
                  <th style="padding:10px">Description</th>
                  <th style="padding:10px">Category</th>
                  <th style="padding:10px">Amount</th>
                  <th style="padding:10px">Type</th>
                  <th style="padding:10px">Payment</th>
                  <th style="padding:10px">Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
          </html>
        `;
        
        const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-selected-${today}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast('success', `Exported ${exportTransactions.length} transactions as Excel`);
      } else if (format === 'pdf') {
        // PDF Export (print view)
        const rows = exportTransactions.map((t, i) => {
          const amount = Math.abs(t.amount).toFixed(2);
          const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
          const color = t.type === 'income' ? '#059669' : '#dc2626';
          
          return `<tr style="background:${bg}">
            <td style="padding:8px;border:1px solid #ddd;font-size:10px">${t.date}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:10px">${t.merchant || 'Unknown'}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:10px">${t.description}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:10px">${t.category}</td>
            <td style="padding:8px;border:1px solid #ddd;font-size:10px;color:${color};font-weight:bold;text-align:right">
              ${t.type === 'income' ? '+' : '-'}$${amount}
            </td>
          </tr>`;
        }).join('');
        
        const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
          throw new Error('Popup blocked. Please allow popups to export PDF.');
        }
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>FinTrack Transaction Report (Selected)</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1e40af; font-size: 24px; margin-bottom: 10px; }
              p { color: #6b7280; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th { background: #1e40af; color: white; padding: 10px; text-align: left; border: 1px solid #1e3a8a; font-size: 11px; }
              .print-btn { 
                position: fixed; top: 20px; right: 20px; background: #2563eb; 
                color: white; border: none; padding: 12px 24px; border-radius: 8px; 
                cursor: pointer; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                font-size: 14px;
              }
              .print-btn:hover { background: #1d4ed8; }
              @media print { .print-btn { display: none; } }
            </style>
          </head>
          <body>
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
            <h1>FinTrack Transaction Report (Selected)</h1>
            <p>Generated: ${new Date().toLocaleString()} | Total: ${exportTransactions.length} transactions</p>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Merchant</th><th>Description</th><th>Category</th><th style="text-align:right">Amount</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </body>
          </html>
        `);
        
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.print();
        }, 500);

        toast('success', 'PDF print dialog opened');
      }

      setSelectedTransactions([]);
    } catch (err: any) {
      console.error('Export error:', err);
      toast('error', `Export failed: ${err.message}`);
    }
  };

  const handleBulkDuplicate = () => {
    if (selectedTransactions.length !== 1) {
      toast('info', 'Please select exactly one transaction to duplicate');
      return;
    }

    const transaction = selectedTransactionObjects[0];
    // This will be handled by the parent component
    // For now, just show a toast
    toast('info', 'Duplicate functionality to be implemented by parent');
  };

  const handleClearSelection = () => {
    setSelectedTransactions([]);
  };

  return (
    <div>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`${
              showToast.type === 'success'
                ? 'bg-green-50 border-green-200'
                : showToast.type === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            } border-2 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[320px] animate-slide-in`}
          >
            <p className="flex-1 text-sm font-medium text-gray-900">
              {showToast.message}
            </p>
          </div>
        </div>
      )}

      {/* Bulk Actions Toolbar */}
      <BulkActions
        selectedCount={selectedTransactions.length}
        onBulkDelete={handleBulkDelete}
        onBulkCategorize={handleBulkCategorize}
        onBulkExport={handleBulkExport}
        onBulkDuplicate={handleBulkDuplicate}
        onClearSelection={handleClearSelection}
      />

      {/* Render the table with selection handlers */}
      {renderTable(
        transactions,
        selectedTransactions,
        handleToggleSelect,
        handleToggleSelectAll
      )}

      <style jsx global>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
// app/budget/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Copy, AlertTriangle, CheckCircle, Calendar, RefreshCw, X } from 'lucide-react';
import { budgetService, Budget } from '@/lib/api/services/budget.service';

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const [formData, setFormData] = useState<Budget>({
    category: '',
    amount: 0,
    period: 'monthly',
    rollover: false,
    alertThreshold: 80
  });

  const categories = ['Food', 'Shopping', 'Entertainment', 'Utilities', 'Transportation', 'Healthcare', 'Education', 'Other'];

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await budgetService.getAll();
      setBudgets(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingBudget && editingBudget.id) {
        await budgetService.update(editingBudget.id, formData);
      } else {
        await budgetService.create(formData);
      }
      await fetchBudgets();
      setShowAddModal(false);
      setEditingBudget(null);
      resetForm();
    } catch (err: any) {
      alert(err.message || 'Failed to save budget');
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData(budget);
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.delete(id);
        await fetchBudgets();
      } catch (err: any) {
        alert(err.message || 'Failed to delete budget');
      }
    }
  };

  const handleDuplicate = async (budget: Budget) => {
    try {
      const newBudget = {
        ...budget,
        category: `${budget.category} (Copy)`
      };
      delete newBudget.id;
      await budgetService.create(newBudget);
      await fetchBudgets();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate budget');
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      amount: 0,
      period: 'monthly',
      rollover: false,
      alertThreshold: 80
    });
  };

  const getBudgetStatus = (budget: Budget) => {
    const spent = budget.spent || 0;
    const percentage = (spent / budget.amount) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'red', icon: AlertTriangle };
    if (percentage >= budget.alertThreshold) return { status: 'warning', color: 'yellow', icon: AlertTriangle };
    return { status: 'good', color: 'green', icon: CheckCircle };
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading budgets...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
              <p className="text-gray-600 mt-1">Track your spending against monthly budgets</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchBudgets}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PlusCircle className="w-4 h-4" />
                Add Budget
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedPeriod('monthly')}
              className={`px-4 py-2 rounded-lg ${
                selectedPeriod === 'monthly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedPeriod('yearly')}
              className={`px-4 py-2 rounded-lg ${
                selectedPeriod === 'yearly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Budget</div>
            <div className="text-3xl font-bold text-blue-600">${totalBudget.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">{budgets.length} categories</div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Total Spent</div>
            <div className="text-3xl font-bold text-red-600">${totalSpent.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of budget
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-sm text-gray-600 mb-1">Remaining</div>
            <div className="text-3xl font-bold text-green-600">${totalRemaining.toFixed(2)}</div>
            <div className="text-sm text-gray-500 mt-1">this month</div>
          </div>
        </div>

        {/* Budget List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Category Budgets</h2>
          </div>
          
          {budgets.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets yet</h3>
              <p className="text-gray-600 mb-4">Create your first budget to get started</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Budget
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {budgets.map((budget) => {
                const { status, color, icon: Icon } = getBudgetStatus(budget);
                const spent = budget.spent || 0;
                const percentage = Math.min((spent / budget.amount) * 100, 100);
                const remaining = budget.amount - spent;
                
                return (
                  <div key={budget.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                          <span className="text-sm text-gray-500 capitalize">
                            {budget.period}
                          </span>
                          {budget.rollover && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              Rollover
                            </span>
                          )}
                          <Icon className={`w-5 h-5 text-${color}-600`} />
                        </div>
                        
                        <div className="flex items-baseline gap-4 text-sm">
                          <span className="text-gray-600">
                            Budget: <span className="font-semibold">${budget.amount.toFixed(2)}</span>
                          </span>
                          <span className="text-gray-600">
                            Spent: <span className="font-semibold">${spent.toFixed(2)}</span>
                          </span>
                          <span className={`font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Remaining: ${remaining.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(budget)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(budget)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => budget.id && handleDelete(budget.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">{percentage.toFixed(1)}% used</span>
                        {percentage >= budget.alertThreshold && (
                          <span className={`text-${color}-600 font-medium`}>
                            {status === 'exceeded' ? 'Budget exceeded!' : 'Approaching limit'}
                          </span>
                        )}
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            percentage >= 100
                              ? 'bg-red-600'
                              : percentage >= budget.alertThreshold
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBudget ? 'Edit Budget' : 'Add New Budget'}
                </h2>
                <button onClick={() => { setShowAddModal(false); setEditingBudget(null); resetForm(); }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'yearly' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Get notified when spending reaches this percentage
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rollover"
                    checked={formData.rollover}
                    onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="rollover" className="ml-2 text-sm text-gray-700">
                    Roll over unused budget to next period
                  </label>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBudget(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBudget ? 'Update' : 'Create'} Budget
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetManagement;
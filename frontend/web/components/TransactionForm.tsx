import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionFormProps {
  onSuccess: () => void;
  editTransaction?: Transaction | null;
}

interface Transaction {
  id?: number;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  mlPredicted?: boolean;
}

const CATEGORIES = [
  'FOOD_DINING',
  'GROCERIES',
  'TRANSPORTATION',
  'UTILITIES',
  'ENTERTAINMENT',
  'SHOPPING',
  'HEALTHCARE',
  'EDUCATION',
  'INCOME_SALARY',
  'INCOME_OTHER',
  'OTHER'
];

const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess, editTransaction }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<Transaction>({
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
    category: '',
    mlPredicted: false
  });
  const [predictedCategory, setPredictedCategory] = useState<string>('');
  const [predicting, setPredicting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editTransaction) {
      setFormData(editTransaction);
    }
  }, [editTransaction]);

  // Auto-predict category when description and amount change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.description && formData.amount > 0 && !editTransaction) {
        predictCategory();
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timer);
  }, [formData.description, formData.amount]);

  const predictCategory = async () => {
    setPredicting(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ml/predict`,
        {
          description: formData.description,
          amount: formData.amount
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const predicted = response.data.category;
      setPredictedCategory(predicted);
      
      // Auto-fill if user hasn't selected a category
      if (!formData.category) {
        setFormData(prev => ({ ...prev, category: predicted, mlPredicted: true }));
      }
    } catch (err) {
      console.error('Error predicting category:', err);
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = editTransaction
        ? `${process.env.REACT_APP_API_URL}/api/transactions/${editTransaction.id}`
        : `${process.env.REACT_APP_API_URL}/api/transactions`;

      const method = editTransaction ? 'put' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onSuccess();
      
      // Reset form
      setFormData({
        description: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        type: 'EXPENSE',
        category: '',
        mlPredicted: false
      });
      setPredictedCategory('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900">
        {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="e.g., Grocery shopping at Walmart"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'INCOME' | 'EXPENSE' })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
          {predicting && (
            <span className="ml-2 text-xs text-blue-600">🤖 AI is predicting...</span>
          )}
          {predictedCategory && formData.mlPredicted && (
            <span className="ml-2 text-xs text-green-600">✨ AI suggested</span>
          )}
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value, mlPredicted: false })}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : editTransaction ? 'Update' : 'Add Transaction'}
        </button>
        
        {editTransaction && (
          <button
            type="button"
            onClick={onSuccess}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;
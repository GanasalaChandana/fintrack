"use client";
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface BudgetData {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
}

interface BudgetComparisonChartProps {
  data: BudgetData[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
};

export function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  // Calculate how many categories are over budget
  const overBudget = data.filter(d => d.spent > d.budget).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Budget vs Actual</h3>
          <p className="text-sm text-gray-600">Current month comparison</p>
        </div>
        {overBudget > 0 && (
          <div className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg">
            <span className="text-sm font-bold">{overBudget} over budget</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `$${value / 1000}k`}
          />
          <YAxis 
            type="category"
            dataKey="category" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            width={100}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend />
          <Bar dataKey="budget" fill="#94a3b8" name="Budget" radius={[0, 8, 8, 0]} />
          <Bar dataKey="spent" name="Spent" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.spent > entry.budget ? '#ef4444' : '#10b981'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
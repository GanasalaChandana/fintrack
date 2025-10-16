'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SpendingSummaryResponse {
  totalSpending: number;
  totalIncome: number;
  transactionCount: number;
  categories: Array<{
    categoryName: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
}

interface Props {
  data: SpendingSummaryResponse;
}

export default function SpendingChart({ data }: Props) {
  const chartData = [
    {
      name: 'Summary',
      Spending: data.totalSpending || 0,
      Income: data.totalIncome || 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="Spending" fill="#ef4444" />
        <Bar dataKey="Income" fill="#10b981" />
      </BarChart>
    </ResponsiveContainer>
  );
}
// components/TransactionList.tsx
import React from 'react';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: string;
  mlPredicted: boolean;
}

const TransactionList: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <div key={tx.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <div className="font-medium">{tx.description}</div>
            <div className="text-sm text-gray-500">
              {tx.category.replace(/_/g, ' ')}
              {tx.mlPredicted && <span className="ml-2 text-xs text-blue-600">🤖 AI categorized</span>}
            </div>
          </div>
          <div className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
            {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};
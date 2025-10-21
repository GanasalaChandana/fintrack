'use client';

export default function Reports() {
  const reports = [
    { month: '2025-06', income: 2500.00, expenses: -1780.45, savings: 719.55 },
    { month: '2025-07', income: 2500.00, expenses: -1934.10, savings: 565.90 },
    { month: '2025-08', income: 2500.00, expenses: -1842.72, savings: 657.28 },
    { month: '2025-09', income: 2500.00, expenses: -2010.33, savings: 489.67 },
    { month: '2025-10', income: 2500.00, expenses: -0.00,    savings: 2500.00 }, // demo row
  ];

  const categories = [
    { name: 'Food & Dining', amount: -425.70 },
    { name: 'Housing', amount: -820.00 },
    { name: 'Transportation', amount: -210.35 },
    { name: 'Utilities', amount: -145.20 },
    { name: 'Entertainment', amount: -89.20 },
    { name: 'Other', amount: -90.00 },
  ];

  const downloadCSV = () => {
    const header = 'month,income,expenses,savings';
    const rows = reports.map(r => `${r.month},${r.income},${r.expenses},${r.savings}`).join('\n');
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fintrack_reports.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Reports</h1>
          <p className="text-gray-600">Review summaries, category breakdowns, and export your data.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={downloadCSV}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 shadow"
          >
             Export CSV
          </button>
          <a
            href="/dashboard"
            className="px-5 py-3 rounded-xl bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 shadow-sm"
          >
             Back to Dashboard
          </a>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="py-3">Month</th>
                    <th className="py-3">Income</th>
                    <th className="py-3">Expenses</th>
                    <th className="py-3">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.month} className="border-b last:border-0">
                      <td className="py-3 font-medium text-gray-900">{r.month}</td>
                      <td className="py-3">${r.income.toFixed(2)}</td>
                      <td className="py-3 text-red-600">${Math.abs(r.expenses).toFixed(2)}</td>
                      <td className="py-3 text-green-600">${r.savings.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">Demo data shown. Connect your backend to populate real values.</p>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="space-y-4">
              {categories.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-800">{c.name}</span>
                    <span className="text-red-600">-${Math.abs(c.amount).toFixed(2)}</span>
                  </div>
                  {/* Simple progress bar approximation */}
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${Math.min(100, Math.abs(c.amount) / 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">Bars are scaled for demo purposes only.</p>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Notes</h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Hook these cards to your API (e.g., `/api/reports`) to display live data.</li>
            <li>Replace the demo arrays with server data via `fetch` in a Server Component or route handlers.</li>
            <li>For charts, you can later add a lightweight client chart library if desired.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

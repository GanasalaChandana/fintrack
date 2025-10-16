'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', '123e4567-e89b-12d3-a456-426614174000'); // Replace with actual user ID

    try {
      const response = await fetch('http://localhost:8082/api/transactions/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Successfully uploaded ${data.processedCount || 0} transactions!`,
        });
        setFile(null);
      } else {
        setResult({
          success: false,
          message: data.message || 'Upload failed',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please ensure the backend is running.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Transactions</h1>
          <p className="text-gray-600">Upload a CSV file containing your transaction data</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              file
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <Upload className="mx-auto mb-4 text-gray-400" size={48} />

            {!file ? (
              <>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
                >
                  Choose a file
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="text-gray-500 mt-2">or drag and drop</p>
                <p className="text-sm text-gray-400 mt-1">CSV files only</p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="ml-4 text-red-600 hover:text-red-700"
                >
                  <XCircle size={20} />
                </button>
              </div>
            )}
          </div>

          {/* CSV Format Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Headers: date, description, amount, category (optional)</li>
              <li>• Date format: YYYY-MM-DD</li>
              <li>• Amount: Negative for expenses, positive for income</li>
              <li>• Example: 2025-10-01,Coffee Shop,-4.50,Food</li>
            </ul>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
              !file || uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Transactions'}
          </button>

          {/* Result Message */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                result.success
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle className="flex-shrink-0" size={20} />
              ) : (
                <XCircle className="flex-shrink-0" size={20} />
              )}
              <p>{result.message}</p>
            </div>
          )}
        </div>

        {/* Sample CSV Download */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              const csv = `date,description,amount,category
2025-10-01,Coffee Shop,-4.50,Food
2025-10-01,Grocery Store,-45.00,Food
2025-10-02,Salary,3000.00,Income
2025-10-02,Gas Station,-35.00,Transport`;
              
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'sample_transactions.csv';
              a.click();
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Download Sample CSV
          </button>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      // TODO: Implement actual file upload to your backend
      // const formData = new FormData();
      // formData.append('file', file);
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
      //   method: 'POST',
      //   body: formData
      // });
      
      // Simulated upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      setMessage('✅ File uploaded successfully! (Demo mode)');
      setFile(null);
    } catch (error) {
      setMessage('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const csv = 'date,description,amount,category\n2025-10-01,Coffee Shop,-4.50,Food\n2025-10-02,Grocery Store,-45.20,Food\n2025-10-03,Salary,2500.00,Income';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_transactions.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Upload Transactions</h1>
          <p className="text-gray-600">Upload a CSV file containing your transaction data</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          {/* Drag and Drop Area */}
          <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors mb-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-semibold text-blue-600 hover:text-blue-700">
                  Choose a file
                </span>
                <span className="text-gray-600"> or drag and drop</span>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-500 mt-2">CSV files only</p>
              
              {file && (
                <div className="mt-4 px-6 py-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected: {file.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {uploading ? 'Uploading...' : 'Upload Transactions'}
          </button>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-medium">{message}</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">CSV Format Requirements</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">1</div>
              <div>
                <p className="font-semibold text-gray-900">Headers Required</p>
                <p className="text-gray-600">date, description, amount, category (optional)</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">2</div>
              <div>
                <p className="font-semibold text-gray-900">Date Format</p>
                <p className="text-gray-600">YYYY-MM-DD (e.g., 2025-10-01)</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">3</div>
              <div>
                <p className="font-semibold text-gray-900">Amount Format</p>
                <p className="text-gray-600">Negative for expenses, positive for income (e.g., -4.50 or 2500.00)</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5">4</div>
              <div>
                <p className="font-semibold text-gray-900">Example Row</p>
                <p className="text-gray-600 font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                  2025-10-01,Coffee Shop,-4.50,Food
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={downloadSample}
            className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
          >
            📥 Download Sample CSV
          </button>
        </div>
      </div>
    </div>
  );
}

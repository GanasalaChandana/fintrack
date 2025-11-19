"use client";

import React, { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowRight,
  Download,
  RefreshCw,
} from "lucide-react";

/* ---------- Types ---------- */

type DetectedColumn = "Date" | "Transaction" | "Merchant" | "Amount" | "Balance" | "Type";
type ColumnKey = "date" | "description" | "amount" | "category";

type RawRow = [string, string, string, string, string, string];

interface ColumnMapping {
  date: DetectedColumn | "";
  description: DetectedColumn | "";
  amount: DetectedColumn | "";
  category: DetectedColumn | "";
}

type PreviewStatus = "valid" | "invalid";

interface PreviewRow {
  id: number;
  date: string;
  description: string;
  amount: string;
  category: string;
  status: PreviewStatus;
}

/* ---------- Component ---------- */

const CSVUploadSystem: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [csvData, setCsvData] = useState<RawRow[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: "",
    description: "",
    amount: "",
    category: "",
  });
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [processing, setProcessing] = useState<boolean>(false);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);

  const detectedColumns: DetectedColumn[] = [
    "Date",
    "Transaction",
    "Merchant",
    "Amount",
    "Balance",
    "Type",
  ];

  const targetColumns: Array<{ key: ColumnKey; label: string; required: boolean }> = [
    { key: "date", label: "Date", required: true },
    { key: "description", label: "Description", required: true },
    { key: "amount", label: "Amount", required: true },
    { key: "category", label: "Category", required: false },
  ];

  /* ---------- Handlers ---------- */

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      handleFile(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected) handleFile(selected);
  };

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);

    // Mock parsed CSV rows (6 columns to match DetectedColumn list)
    const mockData: RawRow[] = [
      ["2025-11-15", "Starbucks", "Coffee Shop", "-5.80", "1234.56", "Debit"],
      ["2025-11-14", "Amazon", "Online Shopping", "-89.99", "1240.36", "Debit"],
      ["2025-11-13", "Salary", "Employer Inc", "3500.00", "1330.35", "Credit"],
      ["2025-11-12", "Uber", "Transportation", "-15.50", "-2169.65", "Debit"],
    ];

    setCsvData(mockData);
    setStep(2);

    // Auto-detect likely mappings
    setTimeout(() => {
      setColumnMapping({
        date: "Date",
        description: "Merchant",
        amount: "Amount",
        category: "", // optional
      });
    }, 300);
  };

  const handleMappingChange = (targetKey: ColumnKey, sourceColumn: DetectedColumn | "") => {
    setColumnMapping((prev) => ({ ...prev, [targetKey]: sourceColumn }));
  };

  const safePick = (row: RawRow, column: DetectedColumn | ""): string => {
    if (!column) return "";
    const idx = detectedColumns.indexOf(column);
    return idx >= 0 ? row[idx] : "";
    // If you change detectedColumns order, adjust mapping accordingly
  };

  const handlePreview = () => {
    setProcessing(true);

    setTimeout(() => {
      const previewData: PreviewRow[] = csvData.slice(0, 5).map((row, i) => ({
        id: i + 1,
        date: safePick(row, columnMapping.date),
        description: safePick(row, columnMapping.description),
        amount: safePick(row, columnMapping.amount),
        category: columnMapping.category ? safePick(row, columnMapping.category) : "Uncategorized",
        status: "valid",
      }));

      setPreview(previewData);
      setProcessing(false);
      setStep(3);
    }, 800);
  };

  const handleImport = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setUploadComplete(true);
      setStep(4);
    }, 1200);
  };

  const resetUpload = () => {
    setStep(1);
    setFile(null);
    setCsvData([]);
    setColumnMapping({ date: "", description: "", amount: "", category: "" });
    setPreview([]);
    setUploadComplete(false);
  };

  /* ---------- UI Sections (unchanged structurally, typed) ---------- */

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Transactions</h2>
        <p className="text-gray-600">Import CSV files from your bank or financial institution</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
          isDragging
            ? "border-blue-500 bg-blue-50 scale-105"
            : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />

        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Upload className="w-10 h-10 text-white" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isDragging ? "Drop your file here" : "Drag & drop your CSV file"}
          </h3>
          <p className="text-gray-600 mb-6">or click to browse from your computer</p>

          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <FileText className="w-5 h-5" />
            Select CSV File
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Supported Formats
        </h4>
        <ul className="text-sm text-blue-800 space-y-1 ml-7">
          <li>• CSV files (.csv)</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Must include Date, Description, and Amount columns</li>
        </ul>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
          <div className="text-3xl font-bold text-green-700">1</div>
          <div className="text-sm text-green-600 font-medium">Upload File</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-xl">
          <div className="text-3xl font-bold text-gray-400">2</div>
          <div className="text-sm text-gray-500 font-medium">Map Columns</div>
        </div>
        <div className="bg-gray-100 p-4 rounded-xl">
          <div className="text-3xl font-bold text-gray-400">3</div>
          <div className="text-sm text-gray-500 font-medium">Review &amp; Import</div>
        </div>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Map Your Columns</h2>
          <p className="text-gray-600">Match your CSV columns to our fields</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="font-medium text-gray-700">{file?.name}</span>
          <span className="text-gray-400">({csvData.length} rows)</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="space-y-4">
          {targetColumns.map((target) => (
            <div key={target.key} className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {target.label}
                  {target.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <div className="text-xs text-gray-500">Target field</div>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <ArrowRight className="w-5 h-5 text-gray-400" />
                <select
                  value={columnMapping[target.key]}
                  onChange={(e) =>
                    handleMappingChange(target.key, e.target.value as DetectedColumn | "")
                  }
                  className="flex-1 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg font-medium text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
                >
                  <option value="">Select column...</option>
                  {detectedColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Smart Mapping Detected
        </h4>
        <p className="text-sm text-amber-800">
          We&apos;ve automatically detected the most likely column matches. Please review and adjust
          if needed.
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={resetUpload}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handlePreview}
          disabled={!columnMapping.date || !columnMapping.description || !columnMapping.amount}
          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Preview Data
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Your Data</h2>
          <p className="text-gray-600">Preview before importing {csvData.length} transactions</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {preview.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{row.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {row.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    {row.amount}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-sm text-gray-600 text-center">
          Showing first 5 of {csvData.length} transactions
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Back to Mapping
        </button>
        <button
          onClick={handleImport}
          disabled={processing}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-400 transition-all shadow-lg"
        >
          {processing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Import {csvData.length} Transactions
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-12">
      <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-xl animate-bounce">
        <CheckCircle className="w-12 h-12 text-white" />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Import Successful!</h2>
        <p className="text-lg text-gray-600">{csvData.length} transactions have been added</p>
      </div>

      <div className="flex gap-3 justify-center pt-6">
        <button
          onClick={resetUpload}
          className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          <Upload className="w-5 h-5" />
          Upload Another File
        </button>
        <button
          onClick={() => (window.location.href = "/dashboard")}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {processing && step !== 4 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                <div>
                  <div className="font-semibold text-blue-900">Processing...</div>
                  <div className="text-sm text-blue-700">Please wait while we process your data</div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && renderUploadStep()}
          {step === 2 && renderMappingStep()}
          {step === 3 && renderPreviewStep()}
          {step === 4 && renderSuccessStep()}
        </div>

        {step === 1 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Need a sample CSV file?</p>
            <button className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              Download Sample Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CSVUploadSystem;

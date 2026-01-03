"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Edit2,
  Save,
} from "lucide-react";
import { parseReceiptImage, type ParsedReceipt } from "@/lib/utils/ocrParser";

interface ReceiptScannerProps {
  onReceiptParsed?: (receipt: ParsedReceipt) => void;
  onSaveTransaction?: (transaction: any) => void;
}

export function ReceiptScanner({ onReceiptParsed, onSaveTransaction }: ReceiptScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setError(null);
      setParsedData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!imageFile) {
      setError("Please select an image first");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await parseReceiptImage(imageFile);
      setParsedData(result);
      setEditedData({
        merchant: result.merchant,
        date: result.date,
        amount: result.total,
        category: result.category,
        description: `Receipt from ${result.merchant}`,
        type: "expense",
      });
      
      if (onReceiptParsed) {
        onReceiptParsed(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse receipt");
      console.error("Receipt parsing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTransaction = () => {
    if (!editedData || !onSaveTransaction) return;
    onSaveTransaction(editedData);
    handleReset();
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageFile(null);
    setParsedData(null);
    setError(null);
    setIsEditing(false);
    setEditedData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return "High";
    if (confidence >= 0.4) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!selectedImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Camera Upload */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <Camera className="mx-auto mb-4 h-12 w-12 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 mb-2">Take Photo</h3>
            <p className="text-sm text-gray-600">
              Use your device camera to capture a receipt
            </p>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </button>

          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <Upload className="mx-auto mb-4 h-12 w-12 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 mb-2">Upload Image</h3>
            <p className="text-sm text-gray-600">
              Select a receipt image from your device
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview & Scan */}
      {selectedImage && !parsedData && (
        <div className="rounded-xl bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Preview</h3>
            <button
              onClick={handleReset}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-6">
            <img
              src={selectedImage}
              alt="Receipt preview"
              className="mx-auto max-h-96 rounded-lg border-2 border-gray-200 object-contain"
            />
          </div>

          <button
            onClick={handleScan}
            disabled={isProcessing}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Camera className="h-5 w-5" />
                Scan Receipt
              </span>
            )}
          </button>
        </div>
      )}

      {/* Parsed Results */}
      {parsedData && (
        <div className="space-y-4">
          {/* Confidence Badge */}
          <div className={`rounded-lg border-2 p-4 ${getConfidenceColor(parsedData.confidence)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5" />
                <span className="font-semibold">
                  Scan Complete - {getConfidenceLabel(parsedData.confidence)} Confidence
                </span>
              </div>
              <span className="text-sm font-mono">
                {(parsedData.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Extracted Data */}
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Extracted Data</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                <Edit2 className="h-4 w-4" />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant
                  </label>
                  <input
                    type="text"
                    value={editedData?.merchant || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, merchant: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editedData?.date || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, date: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editedData?.amount || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, amount: parseFloat(e.target.value) })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={editedData?.category || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, category: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Bills & Utilities">Bills & Utilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editedData?.description || ""}
                    onChange={(e) =>
                      setEditedData({ ...editedData, description: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-700">Merchant:</span>
                  <span className="text-gray-900">{parsedData.merchant}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-700">Date:</span>
                  <span className="text-gray-900">{parsedData.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-700">Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${parsedData.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                    {parsedData.category}
                  </span>
                </div>
                {parsedData.items.length > 0 && (
                  <div className="pt-2">
                    <span className="font-medium text-gray-700 mb-2 block">
                      Items ({parsedData.items.length}):
                    </span>
                    <ul className="space-y-1 text-sm text-gray-600 max-h-40 overflow-y-auto">
                      {parsedData.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>${item.price.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveTransaction}
                className="flex-1 rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-green-700 hover:to-green-800"
              >
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Transaction
                </span>
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Scan Another
              </button>
            </div>
          </div>

          {/* Preview Image */}
          {selectedImage && (
            <div className="rounded-xl bg-white p-4 shadow-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Original Image</h4>
              <img
                src={selectedImage}
                alt="Receipt"
                className="mx-auto max-h-48 rounded-lg border border-gray-200 object-contain"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
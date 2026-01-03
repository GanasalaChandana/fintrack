"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import { ReceiptScanner } from "@/components/ReceiptScanner";
import { transactionsAPI, isAuthenticated as checkAuth } from "@/lib/api";
import type { ParsedReceipt } from "@/lib/utils/ocrParser";

export default function ReceiptsPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authenticated = checkAuth();
      if (!authenticated) {
        router.replace("/register?mode=signin&reason=session_required");
      } else {
        setIsAuth(true);
        setIsLoading(false);
      }
    }
  }, [router]);

  const handleReceiptParsed = (receipt: ParsedReceipt) => {
    console.log("✅ Receipt parsed successfully:", receipt);
  };

  const handleSaveTransaction = async (transaction: any) => {
    try {
      console.log("💾 Saving transaction from receipt:", transaction);
      
      await transactionsAPI.create({
        date: transaction.date,
        merchant: transaction.merchant,
        description: transaction.description || `Receipt from ${transaction.merchant}`,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type || "expense",
      });

      console.log("✅ Transaction saved successfully");
      setSaveSuccess(true);
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("❌ Failed to save transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  if (isLoading || !isAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-indigo-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="rounded-lg bg-green-600 px-6 py-4 text-white shadow-xl">
            <div className="flex items-center gap-3">
              <Camera className="h-5 w-5" />
              <span className="font-semibold">Transaction saved successfully!</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <Camera className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Receipt Scanner</h1>
                  <p className="text-gray-600">Scan receipts and extract transaction data automatically</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <ReceiptScanner
            onReceiptParsed={handleReceiptParsed}
            onSaveTransaction={handleSaveTransaction}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-xl bg-blue-50 border-2 border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-3">📸 Tips for Best Results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ Ensure good lighting - avoid shadows</li>
            <li>✓ Keep the receipt flat and fully visible</li>
            <li>✓ Capture the entire receipt in the frame</li>
            <li>✓ Use high contrast - dark text on light background works best</li>
            <li>✓ Avoid blurry images - hold your device steady</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
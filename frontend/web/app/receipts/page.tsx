"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, ArrowLeft, Sparkles, X } from "lucide-react";
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
    console.log("✅ Receipt parsed:", receipt);
  };

  const handleSaveTransaction = async (transaction: any) => {
    try {
      await transactionsAPI.create({
        date: transaction.date,
        merchant: transaction.merchant,
        description: transaction.description || `Receipt from ${transaction.merchant}`,
        amount: transaction.amount,
        category: transaction.category,
        type: transaction.type || "expense",
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Failed to save transaction. Please try again.");
    }
  };

  if (isLoading || !isAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Toast */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400"
          style={{ animation: "slideUp 0.3s ease" }}>
          <span className="font-bold text-sm">✓ Transaction saved!</span>
          <button onClick={() => setSaveSuccess(false)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex items-start gap-4">
          <button onClick={() => router.push("/dashboard")}
            className="mt-1 p-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:bg-slate-50 hover:shadow-md transition-all text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">AI Powered</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Receipt Scanner</h1>
            <p className="text-gray-400 text-sm mt-1">Scan receipts and extract transaction data automatically.</p>
          </div>
        </div>

        {/* Scanner Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1.5 w-full" style={{ background: "linear-gradient(to right,#6366f1,#8b5cf6,#a855f7)" }} />
          <div className="p-6">
            <ReceiptScanner
              onReceiptParsed={handleReceiptParsed}
              onSaveTransaction={handleSaveTransaction}
            />
          </div>
        </div>

        {/* Tips Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-amber-400" />
          <div className="p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-3">Tips for Best Results</h3>
              <ul className="space-y-2">
                {[
                  "Ensure good lighting — avoid shadows",
                  "Keep the receipt flat and fully visible",
                  "Capture the entire receipt in the frame",
                  "Use high contrast — dark text on light background works best",
                  "Avoid blurry images — hold your device steady",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2.5 text-sm text-gray-500">
                    <span className="text-amber-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
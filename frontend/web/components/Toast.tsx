"use client";

/**
 * Toast System
 *
 * 1. Wrap your app (or layout) with <ToastProvider>
 * 2. Call useToast() in any client component to show toasts
 *
 * Example usage in your TransactionImport component:
 *
 *   const { toast } = useToast();
 *
 *   // After successful import:
 *   toast.success(`Imported ${count} transactions successfully!`);
 *
 *   // Other variants:
 *   toast.error("Failed to import. Please check your CSV format.");
 *   toast.info("Processing your file...");
 *   toast.warning("Some transactions were skipped (duplicates).");
 */

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void;
    error:   (message: string, duration?: number) => void;
    info:    (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    toast: {
      success: (msg, dur) => addToast("success", msg, dur),
      error:   (msg, dur) => addToast("error",   msg, dur),
      info:    (msg, dur) => addToast("info",     msg, dur),
      warning: (msg, dur) => addToast("warning",  msg, dur),
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Toast Container ──────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  success: "✅",
  error:   "❌",
  info:    "ℹ️",
  warning: "⚠️",
};

const COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)",  text: "#6ee7b7" },
  error:   { bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)",   text: "#fca5a5" },
  info:    { bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.3)",  text: "#a5b4fc" },
  warning: { bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)",  text: "#fcd34d" },
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: 380,
        width: "calc(100vw - 48px)",
      }}
    >
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      {toasts.map((t) => {
        const c = COLORS[t.type];
        return (
          <div
            key={t.id}
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 12,
              padding: "12px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              animation: "toastIn 0.25s ease",
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{ICONS[t.type]}</span>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: c.text,
                margin: 0,
                lineHeight: 1.5,
                flex: 1,
              }}
            >
              {t.message}
            </p>
            <button
              onClick={() => onDismiss(t.id)}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                cursor: "pointer",
                padding: 0,
                fontSize: 16,
                lineHeight: 1,
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
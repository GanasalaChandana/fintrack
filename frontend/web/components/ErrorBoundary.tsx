"use client";

/**
 * ErrorBoundary
 *
 * Catches runtime errors in any child component tree and shows a
 * graceful fallback instead of a blank page.
 *
 * Usage — wrap individual page sections:
 *
 *   <ErrorBoundary label="Dashboard">
 *     <DashboardContent />
 *   </ErrorBoundary>
 *
 *   <ErrorBoundary label="Reports" compact>
 *     <ReportsChart />
 *   </ErrorBoundary>
 *
 * For full-page protection, wrap the page in layout:
 *
 *   <ErrorBoundary label="Page">
 *     {children}
 *   </ErrorBoundary>
 */

import { Component, ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** Short name shown in the error card, e.g. "Dashboard", "Reports" */
  label?: string;
  /** Compact mode — smaller card, good for widget-level errors */
  compact?: boolean;
  /** Custom fallback to render instead of the default card */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with your error tracking SDK (Sentry, etc.) if needed
    console.error(`[ErrorBoundary: ${this.props.label ?? "unknown"}]`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, label, compact, fallback } = this.props;

    if (!hasError) return children;

    if (fallback) return fallback;

    if (compact) {
      return (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12,
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#fca5a5", margin: 0 }}>
              {label ? `${label} failed to load` : "Something went wrong"}
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#fca5a5",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 12,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 20,
            padding: "40px 48px",
            textAlign: "center",
            maxWidth: 480,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 16 }}>💥</div>
          <h3
            style={{
              fontFamily: "Fraunces, serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: 10,
            }}
          >
            {label ? `${label} crashed` : "Something went wrong"}
          </h3>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>
            This section encountered an unexpected error. The rest of the app is unaffected.
          </p>
          {error?.message && (
            <p
              style={{
                fontSize: 12,
                color: "#ef4444",
                fontFamily: "monospace",
                background: "rgba(239,68,68,0.08)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 24,
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </p>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={this.handleRetry}
              style={{
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                border: "none",
                color: "white",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "transparent",
                border: "1px solid rgba(148,163,184,0.2)",
                color: "#94a3b8",
                borderRadius: 10,
                padding: "10px 20px",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
"use client";

import { useState, useEffect, useRef } from "react";

/**
 * WarmupBanner
 *
 * Pings /api/health on mount. If the backend doesn't respond within
 * SLOW_THRESHOLD_MS, shows a "warming up" banner with a spinner.
 * Dismisses automatically once health check succeeds.
 *
 * Usage: Drop <WarmupBanner /> anywhere in your root layout, e.g. inside
 * app/(dashboard)/layout.tsx or app/layout.tsx.
 */

const SLOW_THRESHOLD_MS = 2000;   // show banner if health check takes > 2s
const POLL_INTERVAL_MS  = 5000;   // retry every 5s while warming up
const MAX_WAIT_MS       = 60000;  // give up after 60s

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function WarmupBanner() {
  const [status, setStatus] = useState<"checking" | "slow" | "ready" | "failed">("checking");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startRef  = useRef(Date.now());
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const ping = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(8000),
      });
      return res.ok || res.status === 401; // 401 = auth required, but service is up
    } catch {
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;

    const slowTimer = setTimeout(() => {
      if (!cancelled) setStatus("slow");
    }, SLOW_THRESHOLD_MS);

    // Start elapsed-seconds counter once we know it's slow
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startRef.current) / 1000));
      if (Date.now() - startRef.current > MAX_WAIT_MS) {
        if (!cancelled) setStatus("failed");
        clearInterval(timerRef.current!);
      }
    }, 1000);

    // Immediate first ping
    ping().then((ok) => {
      if (cancelled) return;
      clearTimeout(slowTimer);
      if (ok) {
        setStatus("ready");
        clearInterval(timerRef.current!);
        clearInterval(pollRef.current!);
        return;
      }
      // Not ready yet — start polling
      pollRef.current = setInterval(async () => {
        const alive = await ping();
        if (alive && !cancelled) {
          setStatus("ready");
          clearInterval(pollRef.current!);
          clearInterval(timerRef.current!);
        }
      }, POLL_INTERVAL_MS);
    });

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
      clearInterval(timerRef.current!);
      clearInterval(pollRef.current!);
    };
  }, []);

  // Don't render anything while fast or once ready
  if (status === "checking" || status === "ready") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        background: status === "failed" ? "#1e1015" : "#0f172a",
        border: `1px solid ${status === "failed" ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"}`,
        borderRadius: 14,
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        maxWidth: "90vw",
        animation: "slideUp 0.3s ease",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {status === "slow" && (
        <>
          {/* Spinner */}
          <div
            style={{
              width: 18,
              height: 18,
              border: "2px solid rgba(99,102,241,0.3)",
              borderTop: "2px solid #818cf8",
              borderRadius: "50%",
              flexShrink: 0,
              animation: "spin 0.8s linear infinite",
            }}
          />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", margin: 0 }}>
              Services are warming up…
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              Render free tier sleeps after inactivity.
              {elapsedSeconds > 5 && ` Waiting ${elapsedSeconds}s — usually takes 20–30s.`}
            </p>
          </div>
        </>
      )}

      {status === "failed" && (
        <>
          <div style={{ fontSize: 18, flexShrink: 0 }}>⚠️</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fca5a5", margin: 0 }}>
              Services unavailable
            </p>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0" }}>
              Could not connect after {Math.floor(MAX_WAIT_MS / 1000)}s. Please try refreshing.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: 8,
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
        </>
      )}
    </div>
  );
}
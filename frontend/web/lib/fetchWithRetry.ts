// lib/fetchWithRetry.ts
// Handles Render free-tier 429s and cold-start delays gracefully.
// Drop-in replacement for fetch() throughout the app.

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1500; // 1.5s → 3s → 6s → 12s

/**
 * Fetch with exponential backoff retry on 429 Too Many Requests.
 * Also adds a jitter so concurrent requests don't all retry at the same time.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Success or a non-retryable error (4xx except 429) — return immediately
      if (response.status !== 429) {
        return response;
      }

      // 429 — check Retry-After header first, fall back to exponential backoff
      const retryAfter = response.headers.get("Retry-After");
      const delay = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500; // jitter

      if (attempt < retries) {
        console.warn(
          `[fetchWithRetry] 429 on ${url} — retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${retries})`
        );
        await sleep(delay);
        continue;
      }
    } catch (err) {
      // Network error (CORS, DNS, offline) — only retry if attempts remain
      if (attempt < retries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
        console.warn(
          `[fetchWithRetry] Network error on ${url} — retrying in ${Math.round(delay)}ms`,
          err
        );
        await sleep(delay);
        continue;
      }
      throw err;
    }
  }

  throw new Error(`Request to ${url} failed after ${retries} retries (rate limited)`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Request queue ─────────────────────────────────────────────────────────────
// Limits concurrent requests to avoid overwhelming Render's free tier on cold start.
// Usage: const data = await queuedFetch(url, options)

const CONCURRENCY_LIMIT = 3; // max simultaneous requests to the gateway
let activeRequests = 0;
const waitQueue: Array<() => void> = [];

export async function queuedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Wait if at concurrency limit
  if (activeRequests >= CONCURRENCY_LIMIT) {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }

  activeRequests++;
  try {
    return await fetchWithRetry(url, options);
  } finally {
    activeRequests--;
    // Release next waiting request
    const next = waitQueue.shift();
    if (next) next();
  }
}
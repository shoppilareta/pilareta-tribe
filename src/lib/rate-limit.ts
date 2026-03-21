/**
 * In-memory rate limiter using sliding window counters.
 * No external dependencies — uses a simple Map keyed by IP + route.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitOptions {
  /** Max requests allowed within the window */
  limit: number;
  /** Window size in seconds */
  window: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Unix timestamp (seconds) when the window resets */
  reset: number;
}

const store = new Map<string, RateLimitEntry>();

// Auto-cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupTimer() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      // Remove entries whose window has fully expired
      if (now - entry.windowStart > 10 * 60 * 1000) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  // Allow the process to exit even if the timer is still running
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

function getClientIp(request: Request): string {
  const headers = request.headers;
  // Check common proxy headers
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

export async function rateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<RateLimitResult> {
  ensureCleanupTimer();

  const { limit, window: windowSeconds } = options;
  const windowMs = windowSeconds * 1000;
  const now = Date.now();

  const ip = getClientIp(request);
  const path = new URL(request.url).pathname;
  const key = `${ip}:${path}`;

  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= windowMs) {
    // Start a new window
    store.set(key, { count: 1, windowStart: now });
    return {
      success: true,
      remaining: limit - 1,
      reset: Math.ceil((now + windowMs) / 1000),
    };
  }

  // Within the current window
  entry.count += 1;

  if (entry.count > limit) {
    const reset = Math.ceil((entry.windowStart + windowMs) / 1000);
    return {
      success: false,
      remaining: 0,
      reset,
    };
  }

  return {
    success: true,
    remaining: limit - entry.count,
    reset: Math.ceil((entry.windowStart + windowMs) / 1000),
  };
}

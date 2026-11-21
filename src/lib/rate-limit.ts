interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const MAX_STORE_SIZE = 5000;

/**
 * Sweeps and removes keys from the store that have no active timestamps in the given window.
 */
function pruneExpiredEntries(now: number, windowMs: number): void {
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * In-memory sliding window rate limiter with automatic memory reclamation.
 * @param key Identifier (e.g. client IP or device ID)
 * @param maxRequests Maximum allowed requests in the window
 * @param windowMs Window in milliseconds (e.g. 60000 for 1 minute)
 * @returns boolean true if allowed, false if rate limited
 */
export function checkRateLimit(key: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();

  // If memory map grows beyond safety threshold, sweep expired entries
  if (rateLimitStore.size > MAX_STORE_SIZE) {
    pruneExpiredEntries(now, windowMs);
  }

  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Filter out timestamps outside the active window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    rateLimitStore.set(key, record);
    return false;
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);
  return true;
}

/**
 * Resets the rate limit store (useful for test suites).
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}

/**
 * Returns current store size (for monitoring / health tests).
 */
export function getRateLimitStoreSize(): number {
  return rateLimitStore.size;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

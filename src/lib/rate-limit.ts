interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter.
 * @param key Identifier (e.g. client IP or device ID)
 * @param maxRequests Maximum allowed requests in the window
 * @param windowMs Window in milliseconds (e.g. 60000 for 1 minute)
 * @returns boolean true if allowed, false if rate limited
 */
export function checkRateLimit(key: string, maxRequests: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Filter out timestamps outside the active window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    return false;
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);
  return true;
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

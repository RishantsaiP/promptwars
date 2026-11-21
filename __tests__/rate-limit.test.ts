import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimitStore, getRateLimitStoreSize } from '../src/lib/rate-limit';

describe('Sliding Window Rate Limiter & Memory Management', () => {
  beforeEach(() => {
    resetRateLimitStore();
  });

  it('allows requests within the limit', () => {
    const ip = '192.168.1.1';
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(ip, 5, 1000)).toBe(true);
    }
  });

  it('blocks requests exceeding maxRequests within the window', () => {
    const ip = '10.0.0.1';
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(ip, 3, 5000)).toBe(true);
    }
    // 4th request must be rejected
    expect(checkRateLimit(ip, 3, 5000)).toBe(false);
  });

  it('isolates rate limits between different IP addresses', () => {
    const ip1 = '1.1.1.1';
    const ip2 = '2.2.2.2';

    for (let i = 0; i < 3; i++) {
      checkRateLimit(ip1, 3, 5000);
    }
    expect(checkRateLimit(ip1, 3, 5000)).toBe(false);
    expect(checkRateLimit(ip2, 3, 5000)).toBe(true);
  });

  it('prunes expired entries and resets properly', () => {
    checkRateLimit('client-a', 5, 50);
    expect(getRateLimitStoreSize()).toBe(1);

    resetRateLimitStore();
    expect(getRateLimitStoreSize()).toBe(0);
  });
});

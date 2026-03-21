import { describe, it, expect, beforeEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

/**
 * Helper to create a minimal Request-like object.
 * The rateLimit function reads headers and url from the request.
 */
function makeRequest(ip: string, path: string = '/api/test'): Request {
  return new Request(`http://localhost${path}`, {
    headers: {
      'x-forwarded-for': ip,
    },
  });
}

describe('rateLimit', () => {
  // The rate limiter uses an in-memory Map, so we need to use unique IPs/paths
  // per test to avoid state leaking between tests.

  it('allows requests within the limit', async () => {
    const ip = '10.0.0.1';
    const req = makeRequest(ip, '/api/rl-test-1');

    const result = await rateLimit(req, { limit: 5, window: 60 });

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4); // 5 - 1 = 4
  });

  it('decrements remaining count on each request', async () => {
    const ip = '10.0.0.2';
    const path = '/api/rl-test-2';

    const r1 = await rateLimit(makeRequest(ip, path), { limit: 3, window: 60 });
    expect(r1.remaining).toBe(2);

    const r2 = await rateLimit(makeRequest(ip, path), { limit: 3, window: 60 });
    expect(r2.remaining).toBe(1);

    const r3 = await rateLimit(makeRequest(ip, path), { limit: 3, window: 60 });
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests over the limit', async () => {
    const ip = '10.0.0.3';
    const path = '/api/rl-test-3';
    const opts = { limit: 2, window: 60 };

    await rateLimit(makeRequest(ip, path), opts); // 1
    await rateLimit(makeRequest(ip, path), opts); // 2

    const overLimit = await rateLimit(makeRequest(ip, path), opts); // 3 -> blocked
    expect(overLimit.success).toBe(false);
    expect(overLimit.remaining).toBe(0);
  });

  it('tracks different IPs independently', async () => {
    const path = '/api/rl-test-4';
    const opts = { limit: 1, window: 60 };

    // First IP uses its single allowed request
    const r1 = await rateLimit(makeRequest('10.0.0.4', path), opts);
    expect(r1.success).toBe(true);

    // Second IP should still have its own allowance
    const r2 = await rateLimit(makeRequest('10.0.0.5', path), opts);
    expect(r2.success).toBe(true);

    // First IP should now be blocked
    const r3 = await rateLimit(makeRequest('10.0.0.4', path), opts);
    expect(r3.success).toBe(false);
  });

  it('tracks different paths independently', async () => {
    const ip = '10.0.0.6';
    const opts = { limit: 1, window: 60 };

    const r1 = await rateLimit(makeRequest(ip, '/api/rl-test-5a'), opts);
    expect(r1.success).toBe(true);

    const r2 = await rateLimit(makeRequest(ip, '/api/rl-test-5b'), opts);
    expect(r2.success).toBe(true);
  });

  it('returns a reset timestamp in the future', async () => {
    const req = makeRequest('10.0.0.7', '/api/rl-test-6');
    const nowSeconds = Math.floor(Date.now() / 1000);

    const result = await rateLimit(req, { limit: 5, window: 60 });

    expect(result.reset).toBeGreaterThan(nowSeconds);
    expect(result.reset).toBeLessThanOrEqual(nowSeconds + 61); // within window + 1s tolerance
  });

  it('falls back to 127.0.0.1 when no IP headers are present', async () => {
    const req = new Request('http://localhost/api/rl-test-7');
    // No x-forwarded-for or x-real-ip headers

    const result = await rateLimit(req, { limit: 5, window: 60 });
    expect(result.success).toBe(true);
  });
});

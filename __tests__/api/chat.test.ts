/**
 * Unit tests for chat API route helper logic
 *
 * We test the pure helper functions (rate limiting, sanitisation) without
 * importing the full Next.js route handler (which requires a Node runtime).
 */

// ---------------------------------------------------------------------------
// Rate-limit helper (inline, mirrors route.ts logic)
// ---------------------------------------------------------------------------
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function makeIpCache() {
  return new Map<string, { count: number; lastReset: number }>();
}

function checkRateLimit(
  ipCache: Map<string, { count: number; lastReset: number }>,
  ip: string,
  now: number
): boolean {
  const entry = ipCache.get(ip);
  if (!entry || now - entry.lastReset > WINDOW_MS) {
    ipCache.set(ip, { count: 1, lastReset: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

// ---------------------------------------------------------------------------
// Input sanitisation helper (mirrors route.ts logic)
// ---------------------------------------------------------------------------
const MAX_LENGTH = 2_000;

function sanitise(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_LENGTH) return null;
  return trimmed;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Rate limiter', () => {
  it('allows the first request from a new IP', () => {
    const cache = makeIpCache();
    expect(checkRateLimit(cache, '1.2.3.4', Date.now())).toBe(true);
  });

  it('allows up to RATE_LIMIT requests within the window', () => {
    const cache = makeIpCache();
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect(checkRateLimit(cache, '1.2.3.4', now)).toBe(true);
    }
  });

  it('blocks the (RATE_LIMIT + 1)th request within the window', () => {
    const cache = makeIpCache();
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) {
      checkRateLimit(cache, '1.2.3.4', now);
    }
    expect(checkRateLimit(cache, '1.2.3.4', now)).toBe(false);
  });

  it('resets after the window expires', () => {
    const cache = makeIpCache();
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) {
      checkRateLimit(cache, '1.2.3.4', now);
    }
    // Simulate time passing beyond the window
    const later = now + WINDOW_MS + 1;
    expect(checkRateLimit(cache, '1.2.3.4', later)).toBe(true);
  });

  it('tracks different IPs independently', () => {
    const cache = makeIpCache();
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) {
      checkRateLimit(cache, '1.1.1.1', now);
    }
    // Second IP should still be allowed
    expect(checkRateLimit(cache, '2.2.2.2', now)).toBe(true);
  });
});

describe('Input sanitiser', () => {
  it('returns null for non-string input', () => {
    expect(sanitise(42)).toBeNull();
    expect(sanitise(null)).toBeNull();
    expect(sanitise(undefined)).toBeNull();
    expect(sanitise({})).toBeNull();
  });

  it('returns null for empty or whitespace-only strings', () => {
    expect(sanitise('')).toBeNull();
    expect(sanitise('   ')).toBeNull();
  });

  it('returns null when message exceeds max length', () => {
    expect(sanitise('a'.repeat(MAX_LENGTH + 1))).toBeNull();
  });

  it('returns trimmed string for valid input', () => {
    expect(sanitise('  Hello world  ')).toBe('Hello world');
  });

  it('accepts a message exactly at max length', () => {
    const msg = 'a'.repeat(MAX_LENGTH);
    expect(sanitise(msg)).toBe(msg);
  });
});

import { type RateLimitPolicy } from '@/lib/rate-limit/config';

type StoredSlidingWindowCounter = {
  currentWindowStart: number;
  currentCount: number;
  previousWindowStart: number;
  previousCount: number;
};

export type CheckRateLimitInput = {
  kv: KVNamespace;
  routeId: string;
  identifier: string;
  now?: number;
} & RateLimitPolicy;

export type CheckRateLimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number;
  retryAfter: number;
  effectiveCount: number;
};

export function getClientIdentifier(request: Request): string {
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }

  return 'unknown';
}

export function getRouteId(request: Request): string {
  const url = new URL(request.url);
  return `${request.method.toUpperCase()}:${url.pathname}`;
}

export function makeRateLimitKey(routeId: string, identifier: string): string {
  return `rate:${encodeURIComponent(routeId)}:${encodeURIComponent(identifier)}`;
}

function normalizeCounter(
  counter: StoredSlidingWindowCounter | null,
  currentWindowStart: number,
  windowMs: number
): StoredSlidingWindowCounter {
  const previousWindowStart = currentWindowStart - windowMs;
  if (!counter) {
    return {
      currentWindowStart,
      currentCount: 0,
      previousWindowStart,
      previousCount: 0,
    };
  }

  if (counter.currentWindowStart > currentWindowStart) {
    return {
      currentWindowStart,
      currentCount: 0,
      previousWindowStart,
      previousCount: 0,
    };
  }

  if (counter.currentWindowStart === currentWindowStart) {
    return {
      ...counter,
      previousWindowStart,
      previousCount:
        counter.previousWindowStart === previousWindowStart ? counter.previousCount : 0,
    };
  }

  if (counter.currentWindowStart === previousWindowStart) {
    return {
      currentWindowStart,
      currentCount: 0,
      previousWindowStart,
      previousCount: counter.currentCount,
    };
  }

  return {
    currentWindowStart,
    currentCount: 0,
    previousWindowStart,
    previousCount: 0,
  };
}

export function calculateEffectiveCount(
  counter: StoredSlidingWindowCounter,
  now: number,
  windowMs: number
): number {
  const elapsedInCurrentWindow = now - counter.currentWindowStart;
  const overlapFactor = Math.max(0, Math.min(1, 1 - elapsedInCurrentWindow / windowMs));
  return counter.currentCount + counter.previousCount * overlapFactor;
}

export async function checkRateLimit(input: CheckRateLimitInput): Promise<CheckRateLimitResult> {
  const now = input.now ?? Date.now();
  const currentWindowStart = Math.floor(now / input.windowMs) * input.windowMs;
  const reset = currentWindowStart + input.windowMs;
  const key = makeRateLimitKey(input.routeId, input.identifier);

  const raw = await input.kv.get(key);
  const parsed = raw ? (JSON.parse(raw) as StoredSlidingWindowCounter) : null;
  const counter = normalizeCounter(parsed, currentWindowStart, input.windowMs);
  const effectiveCount = calculateEffectiveCount(counter, now, input.windowMs);

  if (effectiveCount >= input.limit) {
    const retryAfter = Math.max(1, Math.ceil((reset - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      reset,
      retryAfter,
      effectiveCount,
    };
  }

  const updatedCounter: StoredSlidingWindowCounter = {
    ...counter,
    currentCount: counter.currentCount + 1,
  };

  await input.kv.put(key, JSON.stringify(updatedCounter), {
    expirationTtl: Math.ceil((input.windowMs * 2) / 1000),
  });

  const updatedEffectiveCount = calculateEffectiveCount(updatedCounter, now, input.windowMs);
  const remaining = Math.max(0, Math.floor(input.limit - updatedEffectiveCount));

  return {
    allowed: true,
    remaining,
    reset,
    retryAfter: 0,
    effectiveCount: updatedEffectiveCount,
  };
}

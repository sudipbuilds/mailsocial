import { NextResponse, type NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import {
  checkRateLimit,
  getClientIdentifier,
  getRouteId,
  type CheckRateLimitResult,
} from '@/lib/rateLimit';
import {
  resolveRateLimitPolicy,
  type RateLimitPolicy,
  type RouteRateLimitPolicies,
} from '@/lib/rateLimit/config';
import { logger } from '@/lib/logger';

type RateLimitOptions = {
  routeId?: string;
  policy?: Partial<RateLimitPolicy>;
  routePolicies?: RouteRateLimitPolicies;
  getIdentifier?: (request: NextRequest) => string;
};

type RouteHandler<TArgs extends unknown[] = unknown[]> = (
  request: NextRequest,
  ...args: TArgs
) => Promise<Response> | Response;

function appendRateLimitHeaders(
  response: Response,
  result: CheckRateLimitResult,
  limit: number
): Response {
  const next = new Response(response.body, response);
  next.headers.set('X-RateLimit-Limit', String(limit));
  next.headers.set('X-RateLimit-Remaining', String(result.remaining));
  next.headers.set('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)));
  if (!result.allowed) {
    next.headers.set('Retry-After', String(result.retryAfter));
  }
  return next;
}

export function withRateLimit<TArgs extends unknown[] = unknown[]>(
  handler: RouteHandler<TArgs>,
  options?: RateLimitOptions
) {
  return async function rateLimitedRoute(request: NextRequest, ...args: TArgs): Promise<Response> {
    const routeId = options?.routeId ?? getRouteId(request);
    const policy = resolveRateLimitPolicy(routeId, {
      policy: options?.policy,
      routePolicies: options?.routePolicies,
    });
    const identifier = options?.getIdentifier?.(request) ?? getClientIdentifier(request);

    const { env } = await getCloudflareContext({ async: true });
    if (!env.KV) {
      logger.error({ routeId }, 'KV namespace not configured for rate limiter');
      return NextResponse.json({ error: 'Rate limiter not configured' }, { status: 500 });
    }

    const limitResult = await checkRateLimit({
      kv: env.KV,
      routeId,
      identifier,
      limit: policy.limit,
      windowMs: policy.windowMs,
    });

    if (!limitResult.allowed) {
      logger.warn(
        { routeId, identifier, retryAfter: limitResult.retryAfter },
        'Rate limit exceeded'
      );
      const response = NextResponse.json(
        { error: 'Too Many Requests', retryAfter: limitResult.retryAfter },
        { status: 429 }
      );
      return appendRateLimitHeaders(response, limitResult, policy.limit);
    }

    const response = await handler(request, ...args);
    return appendRateLimitHeaders(response, limitResult, policy.limit);
  };
}

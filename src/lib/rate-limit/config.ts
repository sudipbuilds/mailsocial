export type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

export type RouteRateLimitPolicies = Record<string, Partial<RateLimitPolicy>>;

export const DEFAULT_RATE_LIMIT_POLICY: RateLimitPolicy = {
  limit: 50,
  windowMs: 60_000,
};

export const ROUTE_RATE_LIMIT_POLICIES: RouteRateLimitPolicies = {};

export function resolveRateLimitPolicy(
  routeId: string,
  options?: {
    routePolicies?: RouteRateLimitPolicies;
    policy?: Partial<RateLimitPolicy>;
  }
): RateLimitPolicy {
  const routePolicy = options?.routePolicies?.[routeId] ?? ROUTE_RATE_LIMIT_POLICIES[routeId];
  return {
    ...DEFAULT_RATE_LIMIT_POLICY,
    ...routePolicy,
    ...options?.policy,
  };
}

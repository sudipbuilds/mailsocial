import type { NextRequest } from 'next/server';
import type { Logger } from 'pino';

import { createRouteLogger } from '@/lib/logger';
import { error, handleUnexpectedError } from '@/lib/api/error';

export type ApiContext = {
  log: Logger;
  error: typeof error;
};

type RouteHandler<TArgs extends unknown[] = unknown[]> = (
  request: NextRequest,
  ctx: ApiContext,
  ...args: TArgs
) => Promise<Response> | Response;

export function withApiContext<TArgs extends unknown[] = unknown[]>(handler: RouteHandler<TArgs>) {
  return async function apiContextRoute(request: NextRequest, ...args: TArgs): Promise<Response> {
    const log = createRouteLogger(request);
    const ctx: ApiContext = { log, error };

    const start = Date.now();
    try {
      const response = await handler(request, ctx, ...args);
      log.info({ status: response.status, durationMs: Date.now() - start }, 'Request completed');
      return response;
    } catch (err) {
      return handleUnexpectedError(err, log);
    }
  };
}

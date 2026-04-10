import pino from 'pino';
import type { NextRequest } from 'next/server';

const level = process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'development' ? 'debug' : 'info');

export const logger = pino({
  level,
  redact: {
    paths: ['authorization', 'cookie', 'otp', 'secretKey', 'token', 'password'],
    censor: '[REDACTED]',
  },
});

export function createRouteLogger(request: NextRequest) {
  return logger.child({
    route: request.nextUrl.pathname,
    method: request.method,
    requestId: request.headers.get('x-request-id') ?? crypto.randomUUID(),
  });
}

import { NextResponse } from 'next/server';
import type { Logger } from 'pino';

type ErrorResponseBody = { error: string };

export type ApiRouteError = Error | { message: string; stack?: string };

function apiError(message: string, status: number): NextResponse<ErrorResponseBody> {
  return NextResponse.json({ error: message }, { status });
}

export const error = {
  badRequest: (message = 'Bad Request') => apiError(message, 400),
  unauthorized: (message = 'Unauthorized') => apiError(message, 401),
  notFound: (message = 'Not Found') => apiError(message, 404),
  serverError: (message = 'Internal Server Error') => apiError(message, 500),
};

export function handleUnexpectedError(
  err: ApiRouteError,
  log: Logger
): NextResponse<ErrorResponseBody> {
  log.error({ err }, 'Unhandled API error');
  return error.serverError();
}

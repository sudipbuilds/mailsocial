import type { NextRequest } from 'next/server';
import { toNextJsHandler } from 'better-auth/next-js';

import { createAuth } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  const auth = createAuth();
  return toNextJsHandler(auth).GET(req);
}

export async function POST(req: NextRequest) {
  const auth = createAuth();
  return toNextJsHandler(auth).POST(req);
}

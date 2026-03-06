import type { NextRequest } from 'next/server';
import { toNextJsHandler } from 'better-auth/next-js';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { createAuth } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  const cf = await getCloudflareContext({ async: true });
  const auth = createAuth(cf.env.D1_DATABASE);
  return toNextJsHandler(auth).GET(req);
}

export async function POST(req: NextRequest) {
  const cf = await getCloudflareContext({ async: true });
  const auth = createAuth(cf.env.D1_DATABASE);
  return toNextJsHandler(auth).POST(req);
}

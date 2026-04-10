import { cache } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import config from '@/lib/config';
import * as schema from './schema';

export const getD1Database = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.D1_DATABASE) {
    throw new Error('D1 database not found');
  }

  return drizzle(env.D1_DATABASE, {
    schema,
    logger: false,
  });
});

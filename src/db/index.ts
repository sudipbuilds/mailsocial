import { cache } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import * as schema from './schema';

export const getDb = cache(() => {
  const { env } = getCloudflareContext();

  if (!env.D1_DATABASE) {
    throw new Error('D1 database not found');
  }

  return drizzle(env.D1_DATABASE, { schema, logger: true });
});

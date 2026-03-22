import { cache } from 'react';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const getR2Bucket = cache(async () => {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.R2_BUCKET) {
    throw new Error('R2 bucket not found');
  }

  return env.R2_BUCKET as R2Bucket;
});

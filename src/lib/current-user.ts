import { cache } from 'react';
import { headers } from 'next/headers';

import { createAuth } from '@/lib/auth/config';

export const currentUser = cache(async () => {
  const auth = await createAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});

import { headers } from 'next/headers';

import { createAuth } from './auth/config';

export const currentUser = async () => {
  const auth = createAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
};

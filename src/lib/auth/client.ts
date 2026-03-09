import { createAuthClient } from 'better-auth/react';
import { emailOTPClient, inferAdditionalFields } from 'better-auth/client/plugins';

import config from '@/lib/config';
import { createAuth } from './config';

export const authClient = createAuthClient({
  baseURL: config.baseURL,
  plugins: [emailOTPClient(), inferAdditionalFields<ReturnType<typeof createAuth>>()],
});

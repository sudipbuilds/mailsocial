import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';
import config from '@/lib/config';

export const authClient = createAuthClient({
  baseURL: config.baseURL,
  plugins: [emailOTPClient()],
});

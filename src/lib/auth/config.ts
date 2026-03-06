import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { getDb } from '@/db';
import config from '@/lib/config';
import * as schema from '@/db/schema';

const cf = getCloudflareContext();

export const auth = betterAuth({
  appName: config.appName,
  baseURL: config.baseURL,
  secret: config.auth.secret,
  database: drizzleAdapter(getDb(cf.env.D1_DATABASE), {
    provider: 'sqlite',
    schema,
    usePlural: true,
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP(data, ctx) {
        // TODO: Send verification OTP to email
      },
    }),
  ],
});

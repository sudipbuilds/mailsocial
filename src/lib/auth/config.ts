import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { getDb } from '@/db';
import config from '@/lib/config';
import * as schema from '@/db/schema';

export function createAuth(d1: D1Database) {
  return betterAuth({
    appName: config.appName,
    baseURL: config.baseURL,
    secret: config.auth.secret,
    database: drizzleAdapter(getDb(d1), {
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
}

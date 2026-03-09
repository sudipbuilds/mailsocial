import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { getDb } from '@/db';
import config from '@/lib/config';
import * as schema from '@/db/schema';
import { sendEmailVerificationMail } from '@/lib/mail';

export function createAuth() {
  return betterAuth({
    appName: config.appName,
    baseURL: config.baseURL,
    secret: config.auth.secret,
    database: drizzleAdapter(getDb(), {
      provider: 'sqlite',
      schema,
      usePlural: true,
    }),
    user: {
      additionalFields: {
        username: {
          type: 'string',
          required: true,
          unique: true,
          input: true,
        },
        secretKey: {
          type: 'string',
          required: false,
          unique: true,
          input: true,
        },
      },
    },
    plugins: [
      emailOTP({
        async sendVerificationOTP(data, ctx) {
          if (data.type === 'sign-in') {
            await sendEmailVerificationMail(data.email, data.otp);
          }
        },
      }),
    ],
  });
}

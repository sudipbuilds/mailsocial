import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import config from '@/lib/config';
import { getD1Database } from '@/db';
import * as schema from '@/db/schema';
import { sendEmailVerificationMail } from '@/lib/mail';

export async function createAuth() {
  const db = await getD1Database();
  return betterAuth({
    appName: config.appName,
    baseURL: config.baseURL,
    secret: config.auth.secret,
    database: drizzleAdapter(db, {
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
        bio: {
          type: 'string',
          required: false,
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

export type Session = Awaited<ReturnType<typeof createAuth>>['$Infer']['Session']['session'];
export type User = Awaited<ReturnType<typeof createAuth>>['$Infer']['Session']['user'];

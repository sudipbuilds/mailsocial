import { betterAuth } from 'better-auth';
import { emailOTP } from 'better-auth/plugins';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import config from '@/lib/config';
import { getD1Database } from '@/db';
import * as schema from '@/db/schema';
import { logger } from '@/lib/logger';
import { sendEmailVerificationMail } from '@/lib/mail';

export async function createAuth() {
  const db = await getD1Database();
  return betterAuth({
    appName: config.appName,
    baseURL: config.url,
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
          required: true,
          unique: true,
          input: true,
        },
        bio: {
          type: 'string',
          required: false,
          input: true,
        },
        isPrivate: {
          type: 'boolean',
          required: false,
          input: false,
        },
        website: {
          type: 'string',
          required: false,
          input: false,
        },
      },
    },
    plugins: [
      emailOTP({
        async sendVerificationOTP(data) {
          logger.debug({ email: data.email, otpType: data.type }, 'OTP verification requested');
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

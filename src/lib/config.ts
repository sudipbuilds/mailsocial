import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().optional(),
  EMAIL_WORKER_API_SECRET: z.string().default(''),
  DODOPAYMENTS_BEARER_TOKEN: z.string().default(''),
  DODOPAYMENTS_ENVIRONMENT: z.enum(['test_mode', 'live_mode']).default('test_mode'),
  DODOPAYMENTS_WEBHOOK_KEY: z.string().default(''),
  DODOPAYMENTS_PRODUCT_ID: z.string().default(''),
  RESEND_API_KEY: z.string().default(''),
  NEXT_PUBLIC_RESEND_DOMAIN: z.string().default(''),
  BETTER_AUTH_SECRET: z.string().default(''),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLOUDFLARE_D1_TOKEN: z.string().default(''),
  CLOUDFLARE_ACCOUNT_ID: z.string().default(''),
  CLOUDFLARE_DATABASE_ID: z.string().default(''),
});

const env = envSchema.parse(process.env);

export default {
  appName: 'MailSocial',
  description: 'A place for your thoughts. Powered by email.',
  author: {
    name: 'Sudip Biswas',
    url: 'https://sudipbiswas.me',
    username: 'sudipbuilds',
  },
  ogImage: '/opengraph-image.png',
  domain: 'mailsocial.sudipbiswas.dev',
  url: env.NEXT_PUBLIC_SITE_URL ?? 'https://mailsocial.sudipbiswas.dev',
  emailWorkerAPISecret: env.EMAIL_WORKER_API_SECRET,
  dodopayments: {
    bearerToken: env.DODOPAYMENTS_BEARER_TOKEN,
    environment: env.DODOPAYMENTS_ENVIRONMENT,
    webhookKey: env.DODOPAYMENTS_WEBHOOK_KEY,
    productId: env.DODOPAYMENTS_PRODUCT_ID,
  },
  resend: {
    apiKey: env.RESEND_API_KEY,
    from: `MailSocial <mailsocial@${env.NEXT_PUBLIC_RESEND_DOMAIN}>`,
    domain: env.NEXT_PUBLIC_RESEND_DOMAIN,
  },
  auth: {
    secret: env.BETTER_AUTH_SECRET,
  },
  env: env.NODE_ENV,
  cloudflare: {
    d1: {
      token: env.CLOUDFLARE_D1_TOKEN,
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      databaseId: env.CLOUDFLARE_DATABASE_ID,
    },
  },
} as const;

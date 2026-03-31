import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://mailsocial.sudipbiswas.dev'),
  EMAIL_WORKER_API_SECRET: z.string().min(1),
  DODOPAYMENTS_BEARER_TOKEN: z.string().min(1),
  DODOPAYMENTS_ENVIRONMENT: z.enum(['test_mode', 'live_mode']),
  DODOPAYMENTS_WEBHOOK_KEY: z.string().min(1),
  DODOPAYMENTS_PRODUCT_ID: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  NEXT_PUBLIC_RESEND_DOMAIN: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(1),
  CLOUDFLARE_D1_TOKEN: z.string().min(1),
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_DATABASE_ID: z.string().min(1),
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
  env: env.NODE_ENV,
  url: env.NEXT_PUBLIC_SITE_URL,
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
  cloudflare: {
    d1: {
      token: env.CLOUDFLARE_D1_TOKEN,
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      databaseId: env.CLOUDFLARE_DATABASE_ID,
    },
  },
} as const;

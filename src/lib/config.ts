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
  url: process.env.NEXT_PUBLIC_SITE_URL as string,
  emailWorkerAPISecret: process.env.EMAIL_WORKER_API_SECRET as string,
  dodopayments: {
    bearerToken: process.env.DODOPAYMENTS_BEARER_TOKEN as string,
    environment: process.env.DODO_PAYMENTS_ENVIRONMENT as 'test_mode' | 'live_mode',
    webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY as string,
    productId: process.env.DODO_PAYMENTS_PRODUCT_ID as string,
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY as string,
    from: `MailSocial <mailsocial@${process.env.NEXT_PUBLIC_RESEND_DOMAIN as string}>`,
    domain: process.env.NEXT_PUBLIC_RESEND_DOMAIN as string,
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET as string,
  },
  cloudflare: {
    d1: {
      token: process.env.CLOUDFLARE_D1_TOKEN as string,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID as string,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID as string,
    },
  },
} as const;

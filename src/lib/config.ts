export default {
  appName: 'MailSocial',
  domain: 'mailsocial.co',
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromNoReply: 'no-reply@mailsocial.co',
    fromSupport: 'sudip@mailsocial.co',
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET,
  },
  cloudflare: {
    d1: {
      token: process.env.CLOUDFLARE_D1_TOKEN,
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      databaseId: process.env.CLOUDFLARE_DATABASE_ID,
    },
  },
};

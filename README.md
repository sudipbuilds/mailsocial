# MailSocial

A place for your thoughts. Powered by email.

MailSocial lets you post by sending emails. Send an email to your unique address, and the subject becomes a post on your handle. Private or public, personal or shared—just your thoughts, captured without friction.

## Tech Stack

- **Frontend & Backend**: Next.js 15 (App Router) with TypeScript
- **Hosting**: Cloudflare Workers with OpenNext
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth (passwordless OTP via email)
- **Email Service**: Resend (transactional emails & OTP delivery)
- **Email Routing**: Cloudflare Email Worker
- **Payments**: DodoPayments (one-time $15 Forever Plan)
- **UI**: Tailwind CSS + Radix UI

## How It Works

1. User purchases access via DodoPayments checkout
2. Webhook handler processes payment and sends confirmation email
3. User signs in with email OTP authentication
4. System generates unique secret email address (e.g., `username.abc123@mailsocial.sudipbiswas.dev`)
5. User sends email to that address—subject line becomes a post
6. Cloudflare Email Worker intercepts email and POSTs to Next.js API
7. Post appears on user's profile page

## Local Development

### Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account (for D1 database and email routing)
- Resend API key
- DodoPayments account

### Setup

1. Clone the repository:

```bash
git clone https://github.com/sudipbuilds/mailsocial.git
cd mailsocial
```

2. Install dependencies:

```bash
pnpm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Fill in your `.env` with required credentials (see `.env.example` for required variables)

5. Run database migrations:

```bash
pnpm run db:migrate
```

6. Start development server:

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Preview on Cloudflare Runtime

```bash
pnpm run preview
```

### Deploy

```bash
pnpm run deploy
```

## Related Repositories

- **Email Worker**: [mailsocial-email-worker](https://github.com/sudipbuilds/mailsocial-email-worker) - Cloudflare Email Worker that handles incoming emails

## Live Demo

**Production**: [mailsocial.sudipbiswas.dev](https://mailsocial.sudipbiswas.dev)

## Features

- Email-to-post publishing (subject line only)
- Passwordless authentication with OTP
- One-time payment ($15 Forever Plan)
- Public or private profiles
- Username-based URLs
- Webhook-driven order processing
- Automated transactional emails

---

Built with ❤️ by [Sudip Biswas](https://sudipbiswas.me)

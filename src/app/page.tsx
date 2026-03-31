import Link from 'next/link';
import Image from 'next/image';

import { PageWrapper } from '@/components/page-wrapper';

export default function Home() {
  return (
    <PageWrapper spacing="xl">
      {/* Hero Section */}
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-3xl text-pretty">A place for your thoughts. Powered by email.</h1>
          <p>
            Send an email subject and it becomes a post on your handle. Private or shared, personal
            or public. Just your thoughts, captured without friction.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="px-4 py-2 rounded-full bg-neutral-200/75 text-sm text-secondary-foreground outline-none inline-flex items-center justify-center"
          >
            Start journaling
          </Link>
          <a
            href="/#what-is-mailsocial"
            className="px-4 py-2 rounded-full text-sm text-secondary-foreground outline-none inline-flex items-center justify-center"
          >
            Learn more
          </a>
        </div>
        <p className="text-muted-foreground/75 text-sm">Forever Plan: Pay a one-time fee of $15.</p>
      </div>

      {/* Mockup Section */}
      <div className="relative h-120">
        <Image
          src="/mockup-vertical.webp"
          alt="MailSocial mobile view"
          className="object-left object-contain"
          quality={75}
          priority
          fill
        />
      </div>

      {/* What is MailSocial Section */}
      <div id="what-is-mailsocial" className="space-y-8 scroll-mt-24">
        <h2 className="text-2xl">What is MailSocial?</h2>
        <div className="space-y-6">
          <p>
            MailSocial gives your email a place to land publicly or privately. You send an email to
            your unique address, and the subject becomes a post on your handle.
          </p>
          <p>
            Use it as a private mind dump, a shared space with your partner, or a public handle to
            express what's on your mind. Everything stays minimal and text-only, so the focus
            remains on the thought itself and the ease of putting it out.
          </p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="space-y-8">
        <h2 className="text-2xl">FAQs</h2>
        <div className="space-y-6">
          <div className="space-y-1">
            <p>Q: Why only the subject line?</p>
            <p className="text-muted-foreground">
              A: It keeps every post short, intentional, and easy to write.
            </p>
          </div>
          <div className="space-y-1">
            <p>Q: Can I delete a single post?</p>
            <p className="text-muted-foreground">
              A: You can't. Posts are meant to be written and left as they are.
            </p>
          </div>
          <div className="space-y-1">
            <p>Q: What happens to the email body?</p>
            <p className="text-muted-foreground">
              A: It gets ignored. Only the subject line is used.
            </p>
          </div>
          <div className="space-y-1">
            <p>Q: What if I leave the subject empty</p>
            <p className="text-muted-foreground">
              A: Nothing gets posted. A subject is required to create a post.
            </p>
          </div>
          <div className="space-y-1">
            <p>Q: Can I share my MailSocial email address</p>
            <p className="text-muted-foreground">
              A: You can, if you want to journal together. Otherwise, keep it private.
            </p>
          </div>
          <div className="space-y-1">
            <p>Q: What if I lose my MailSocial email address</p>
            <p className="text-muted-foreground">
              A: Check your sent emails if you've posted before. Or log in and copy it again from
              settings.
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">Still need help? help@mailsocial.sudipbiswas.dev</p>
      </div>

      {/* Footer */}
      <footer className="text-sm text-muted-foreground">© Copyright 2026, MailSocial</footer>
    </PageWrapper>
  );
}

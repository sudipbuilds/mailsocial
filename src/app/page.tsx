import Link from 'next/link';

import { PageWrapper } from '@/components/page-wrapper';

export default function Home() {
  return (
    <PageWrapper>
      <div className="space-y-8">
        <div className="space-y-4 *:tracking-tight">
          <h1 className="text-3xl">The Anti-Social Social Network</h1>
          <p className="">
            Anti-Social lets you post and share notes, links or images by email subject only. From
            any email account.
          </p>
        </div>
        <Link
          href="/signup"
          className="px-4 py-2 rounded-full bg-neutral-200/75 text-sm text-secondary-foreground outline-none inline-flex items-center justify-center"
        >
          Create account / $14.99
        </Link>
      </div>
    </PageWrapper>
  );
}

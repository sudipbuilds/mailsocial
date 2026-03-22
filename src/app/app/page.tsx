import { redirect } from 'next/navigation';

import { currentUser } from '@/lib/current-user';

export default async function MainAppPage() {
  const res = await currentUser();
  if (!res) {
    return redirect('/');
  }

  if (!res.user.secretKey) {
    return redirect('/onboarding');
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      <section className="px-6 py-32 md:py-36 xl:py-40 max-w-md mx-auto *:leading-tight *:tracking-tight">
        <pre className="text-sm font-mono">{JSON.stringify(res, null, 2)}</pre>
      </section>
    </main>
  );
}

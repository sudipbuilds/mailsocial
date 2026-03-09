import { redirect } from 'next/navigation';

import { currentUser } from '@/lib/current-user';
import { SignInForm } from './components/signin-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const { email } = await searchParams;

  const res = await currentUser();
  if (res?.user) {
    redirect('/app');
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      <section className="px-6 py-32 md:py-36 xl:py-40 max-w-md mx-auto *:leading-tight *:tracking-tight">
        <SignInForm email={email} />
      </section>
    </main>
  );
}

import { redirect } from 'next/navigation';

import { currentUser } from '@/lib/current-user';
import { OnboardingForm } from './components/onboarding-form';

export default async function OnboardingPage() {
  const session = await currentUser();

  if (!session?.user) {
    return redirect('/signin');
  }

  if (session.user.secretKey) {
    return redirect('/app');
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      <section className="px-6 py-32 md:py-36 xl:py-40 max-w-md mx-auto *:leading-tight *:tracking-tight">
        <OnboardingForm user={session.user} />
      </section>
    </main>
  );
}

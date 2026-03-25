import { redirect } from 'next/navigation';

import { currentUser } from '@/lib/current-user';
import { UserMenu } from '@/app/[slug]/components/user-menu';
import { SettingsForm } from './components/settings-form';

export default async function SettingsPage() {
  const session = await currentUser();
  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <main className="min-h-dvh bg-neutral-50">
      <section className="space-y-12 px-6 py-32 md:py-36 xl:py-40 max-w-md mx-auto *:leading-tight *:tracking-tight">
        <div className="space-y-8">
          <h1 className="text-lg">Settings</h1>
          <SettingsForm
            defaultValues={{
              name: session.user.name,
              bio: session.user.bio,
              website: session.user.website,
              isPrivate: session.user.isPrivate,
              username: session.user.username,
            }}
          />
        </div>
      </section>
      <UserMenu name={session.user.name} username={session.user.username} />
    </main>
  );
}

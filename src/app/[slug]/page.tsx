import { currentUser } from '@/lib/current-user';

import { UserMenu } from './components/user-menu';

export default async function UserProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const session = await currentUser();
  const isOwnProfile = session?.user?.username === slug;

  return (
    <main className="min-h-dvh bg-neutral-50">
      <section className="space-y-12 px-6 py-32 md:py-36 xl:py-40 max-w-md mx-auto *:leading-tight *:tracking-tight"></section>
      {isOwnProfile && session?.user && (
        <UserMenu name={session.user.name} username={session.user.username} />
      )}
    </main>
  );
}

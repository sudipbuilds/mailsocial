import { redirect } from 'next/navigation';

import { currentUser } from '@/lib/current-user';
import { PageWrapper } from '@/components/page-wrapper';
import { UserMenu } from '@/app/[slug]/components/user-menu';
import { SettingsForm } from './components/settings-form';
import { SecretEmailCard } from '@/components/secret-email-card';

export const metadata = {
  title: 'Settings',
  description: 'Manage your MailSocial settings',
};

export default async function SettingsPage() {
  const session = await currentUser();
  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <PageWrapper
      spacing="md"
      outsideContent={<UserMenu name={session.user.name} username={session.user.username} />}
    >
      <h1 className="text-lg">Settings</h1>
      <SecretEmailCard secretKey={session.user.secretKey} />
      <SettingsForm
        defaultValues={{
          name: session.user.name,
          bio: session.user.bio,
          website: session.user.website,
          isPrivate: session.user.isPrivate,
          username: session.user.username,
        }}
      />
    </PageWrapper>
  );
}

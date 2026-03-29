import { redirect } from 'next/navigation';

import { currentUser } from '@/lib/current-user';
import { PageWrapper } from '@/components/page-wrapper';
import { UsernameForm } from './components/username-form';

export const metadata = {
  title: 'Sign up',
  description: 'Sign up for MailSocial',
};

export default async function Page() {
  const res = await currentUser();
  if (res?.user) {
    return redirect(`/${res.user.username}`);
  }

  return (
    <PageWrapper>
      <UsernameForm />
    </PageWrapper>
  );
}

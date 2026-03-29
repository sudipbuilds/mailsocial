import { redirect } from 'next/navigation';

import { currentUser } from '@/lib/current-user';
import { PageWrapper } from '@/components/page-wrapper';
import { SignInForm } from './components/signin-form';

export const metadata = {
  title: 'Sign in',
  description: 'Sign in to MailSocial',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const { email } = await searchParams;

  const res = await currentUser();
  if (res?.user) {
    redirect(`/${res.user.username}`);
  }

  return (
    <PageWrapper>
      <SignInForm email={email} />
    </PageWrapper>
  );
}

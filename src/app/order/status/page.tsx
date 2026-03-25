import { notFound } from 'next/navigation';

import { PageWrapper } from '@/components/page-wrapper';
import { OrderStatus } from './components/order-status';

export default async function OrderStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string; payment_id: string; status: string }>;
}) {
  const { email, payment_id, status } = await searchParams;
  if (!email || !payment_id || !status) {
    return notFound();
  }

  return (
    <PageWrapper>
      <OrderStatus status={status} email={email} payment_id={payment_id} />
    </PageWrapper>
  );
}

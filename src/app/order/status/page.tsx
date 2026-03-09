import { notFound } from 'next/navigation';

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
    <main className="min-h-dvh bg-neutral-50">
      <section className="px-6 py-32 md:py-36 xl:py-40 max-w-md mx-auto *:leading-tight *:tracking-tight">
        <OrderStatus status={status} email={email} payment_id={payment_id} />
      </section>
    </main>
  );
}

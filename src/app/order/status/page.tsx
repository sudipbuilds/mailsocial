import { notFound } from 'next/navigation';

export default async function OrderStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ email: string; payment_id: string; status: string }>;
}) {
  const { email, payment_id, status } = await searchParams;
  if (!email || !payment_id || !status) {
    return notFound();
  }

  return <div>OrderStatusPage</div>;
}

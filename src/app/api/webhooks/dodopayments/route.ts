import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/db';
import { createDodopayments } from '@/lib/dodopayments';
import { orders, users, webhookEvents } from '@/db/schema';

export async function POST(request: NextRequest) {
  const raw = await request.text();
  const webhookId = request.headers.get('webhook-id')!;
  const webhookSignature = request.headers.get('webhook-signature')!;
  const webhookTimestamp = request.headers.get('webhook-timestamp')!;

  const dodo = createDodopayments();

  let event;
  try {
    event = dodo.webhooks.unwrap(raw, {
      headers: {
        'webhook-id': webhookId,
        'webhook-signature': webhookSignature,
        'webhook-timestamp': webhookTimestamp,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const db = getDb();

  // Idempotency: ignore if already processed
  const existingEvent = await db.query.webhookEvents.findFirst({
    where: eq(webhookEvents.id, webhookId),
  });

  if (existingEvent) {
    return NextResponse.json({ received: true });
  }

  // Log webhook event
  await db.insert(webhookEvents).values({
    id: webhookId,
    eventType: event.type,
    receivedAt: new Date(),
    processed: false,
    raw,
  });

  if (event.type === 'payment.succeeded') {
    const payload = event.data;
    const username = payload.custom_field_responses?.find(field => field.key === 'username')?.value;
    const productId = payload.product_cart?.[0]?.product_id;

    if (!username || !productId) {
      return NextResponse.json({ error: 'Username and product are required' }, { status: 400 });
    }

    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.paymentId, payload.payment_id),
    });
    if (existingOrder) {
      await db
        .update(webhookEvents)
        .set({ processed: true })
        .where(eq(webhookEvents.id, webhookId));
      return NextResponse.json({ received: true });
    }

    // ? Faah! D1 doesn't support SQL transactions - use batch() for atomic operations
    await db.batch([
      db.insert(orders).values({
        productId,
        webhookId,
        userId: null,
        customerId: payload.customer.customer_id,
        customerEmail: payload.customer.email,
        customerName: payload.customer.name,
        customerUsername: username,
        paymentId: payload.payment_id,
        paymentStatus: payload.status as string,
        amount: payload.total_amount,
        currency: payload.currency as string,
        invoiceUrl: payload.invoice_url ?? null,
        paymentMethod: payload.payment_method ?? null,
      }),
      db.update(webhookEvents).set({ processed: true }).where(eq(webhookEvents.id, webhookId)),
    ]);

    return NextResponse.json({ received: true });
  } else if (event.type === 'payment.failed') {
    const payload = event.data;
    // TODO: Send email to user

    await db
      .update(webhookEvents)
      .set({
        processed: true,
      })
      .where(eq(webhookEvents.id, webhookId));

    return NextResponse.json({ received: true });
  } else if (event.type === 'payment.cancelled') {
    const payload = event.data;
    // TODO: Schedule an email to user about the cancellation which will be sent after 24 hours

    await db
      .update(webhookEvents)
      .set({
        processed: true,
      })
      .where(eq(webhookEvents.id, webhookId));

    return NextResponse.json({ received: true });
  } else if (event.type === 'refund.succeeded') {
    const payload = event.data;

    const order = await db.query.orders.findFirst({
      where: eq(orders.paymentId, payload.payment_id),
    });

    if (order) {
      // userId can be null if the user didn't sign up after the payment
      if (order.userId) {
        await db.batch([
          db.delete(users).where(eq(users.id, order.userId)),
          db.update(orders).set({ refundedAt: new Date() }).where(eq(orders.id, order.id)),
          db.update(webhookEvents).set({ processed: true }).where(eq(webhookEvents.id, webhookId)),
        ]);
      } else {
        await db.batch([
          db.update(orders).set({ refundedAt: new Date() }).where(eq(orders.id, order.id)),
          db.update(webhookEvents).set({ processed: true }).where(eq(webhookEvents.id, webhookId)),
        ]);
      }

      return NextResponse.json({ received: true });
    }

    // Log it but return 200 to acknowledge receipt
    console.error('Refund webhook: Order not found for payment_id:', payload.payment_id);
    return NextResponse.json({ received: true, warning: 'Order not found' });
  }

  return NextResponse.json({ received: true, unhandled: event.type });
}

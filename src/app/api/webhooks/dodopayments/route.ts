import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import {
  sendPaymentSuccessEmail,
  sendPaymentFailedEmail,
  sendPaymentCancelledEmail,
  sendRefundSuccessEmail,
} from '@/lib/mail';
import { getD1Database } from '@/db';
import { createDodopayments } from '@/lib/dodopayments';
import { orders, users, webhookEvents } from '@/db/schema';
import { withApiContext } from '@/lib/api/withApiContext';
import { withRateLimit } from '@/lib/rateLimit/withRateLimit';

export const POST = withRateLimit(
  withApiContext(async (request, ctx) => {
    const raw = await request.text();
    const webhookId = request.headers.get('webhook-id');
    const webhookSignature = request.headers.get('webhook-signature');
    const webhookTimestamp = request.headers.get('webhook-timestamp');

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      ctx.log.warn('Webhook received with missing headers');
      return ctx.error.badRequest('Missing webhook headers');
    }

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
    } catch (err) {
      ctx.log.warn({ err }, 'Invalid webhook signature');
      return ctx.error.unauthorized('Invalid signature');
    }

    ctx.log.info({ eventType: event.type, webhookId }, 'Webhook event received');

    const db = await getD1Database();

    // Idempotency: ignore if already processed
    const existingEvent = await db.query.webhookEvents.findFirst({
      where: eq(webhookEvents.id, webhookId),
    });

    if (existingEvent) {
      ctx.log.info({ webhookId }, 'Duplicate webhook event skipped');
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
      const username = payload.custom_field_responses?.find(
        field => field.key === 'username'
      )?.value;
      const productId = payload.product_cart?.[0]?.product_id;

      if (!username || !productId) {
        ctx.log.warn(
          { paymentId: payload.payment_id },
          'Payment succeeded but missing username or product'
        );
        return ctx.error.badRequest('Username and product are required');
      }

      const existingOrder = await db.query.orders.findFirst({
        where: eq(orders.paymentId, payload.payment_id),
      });
      if (existingOrder) {
        ctx.log.info({ paymentId: payload.payment_id }, 'Order already exists for payment');
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

      ctx.log.info({ paymentId: payload.payment_id, username }, 'Order created from payment');

      await sendPaymentSuccessEmail(
        payload.customer.email,
        payload.customer.name,
        payload.invoice_url ?? null
      );

      return NextResponse.json({ received: true });
    } else if (event.type === 'payment.failed') {
      const payload = event.data;
      ctx.log.info(
        { paymentId: payload.payment_id, email: payload.customer.email },
        'Payment failed'
      );

      await sendPaymentFailedEmail(payload.customer.email, payload.customer.name);

      await db
        .update(webhookEvents)
        .set({ processed: true })
        .where(eq(webhookEvents.id, webhookId));

      return NextResponse.json({ received: true });
    } else if (event.type === 'payment.cancelled') {
      const payload = event.data;
      ctx.log.info(
        { paymentId: payload.payment_id, email: payload.customer.email },
        'Payment cancelled'
      );

      await sendPaymentCancelledEmail(payload.customer.email, payload.customer.name);

      await db
        .update(webhookEvents)
        .set({ processed: true })
        .where(eq(webhookEvents.id, webhookId));

      return NextResponse.json({ received: true });
    } else if (event.type === 'refund.succeeded') {
      const payload = event.data;
      ctx.log.info({ paymentId: payload.payment_id }, 'Refund succeeded');

      const order = await db.query.orders.findFirst({
        where: eq(orders.paymentId, payload.payment_id),
      });

      if (order) {
        // userId can be null if the user didn't sign up after the payment
        if (order.userId) {
          await db.batch([
            db.delete(users).where(eq(users.id, order.userId)),
            db.update(orders).set({ refundedAt: new Date() }).where(eq(orders.id, order.id)),
            db
              .update(webhookEvents)
              .set({ processed: true })
              .where(eq(webhookEvents.id, webhookId)),
          ]);
        } else {
          await db.batch([
            db.update(orders).set({ refundedAt: new Date() }).where(eq(orders.id, order.id)),
            db
              .update(webhookEvents)
              .set({ processed: true })
              .where(eq(webhookEvents.id, webhookId)),
          ]);
        }

        await sendRefundSuccessEmail(
          order.customerEmail,
          order.customerName,
          order.amount,
          order.currency
        );

        return NextResponse.json({ received: true });
      }

      ctx.log.warn({ paymentId: payload.payment_id }, 'Refund webhook order not found');
      return NextResponse.json({ received: true, warning: 'Order not found' });
    }

    ctx.log.warn({ eventType: event.type }, 'Unhandled webhook event type');
    return NextResponse.json({ received: true, unhandled: event.type });
  }),
  {
    routeId: 'POST:/api/webhooks/dodopayments',
  }
);

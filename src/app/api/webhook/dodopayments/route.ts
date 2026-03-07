import { NextRequest, NextResponse } from 'next/server';

import { createDodopayments } from '@/lib/dodopayments';
import {
  PaymentCancelledWebhookEvent,
  PaymentFailedWebhookEvent,
  PaymentSucceededWebhookEvent,
  RefundSucceededWebhookEvent,
} from 'dodopayments/resources/index.mjs';

export async function POST(request: NextRequest) {
  const raw = await request.text();
  try {
    const dodoPayments = createDodopayments();
    const event = dodoPayments.webhooks.unwrap(raw, {
      headers: {
        'webhook-id': request.headers.get('webhook-id')!,
        'webhook-signature': request.headers.get('webhook-signature')!,
        'webhook-timestamp': request.headers.get('webhook-timestamp')!,
      },
    });

    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event);
        break;
      case 'payment.cancelled':
        await handlePaymentCancelled(event);
        break;
      case 'refund.succeeded':
        await handleRefundSucceeded(event);
        break;
      default:
        return NextResponse.json({ message: 'Webhook received' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

async function handlePaymentSucceeded(event: PaymentSucceededWebhookEvent) {}

async function handlePaymentFailed(event: PaymentFailedWebhookEvent) {}

async function handleRefundSucceeded(event: RefundSucceededWebhookEvent) {}

async function handlePaymentCancelled(event: PaymentCancelledWebhookEvent) {}

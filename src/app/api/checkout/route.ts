import { NextResponse } from 'next/server';

import config from '@/lib/config';
import { createDodopayments } from '@/lib/dodopayments';
import { withRateLimit } from '@/lib/rateLimit/withRateLimit';
import { withApiContext } from '@/lib/api/withApiContext';

export const POST = withRateLimit(
  withApiContext(async () => {
    const dodoPayments = createDodopayments();

    const checkout = await dodoPayments.checkoutSessions.create({
      product_cart: [
        {
          product_id: config.dodopayments.productId,
          quantity: 1,
        },
      ],
      return_url: `${config.url}/order/status`,
      custom_fields: [
        {
          field_type: 'text',
          key: 'username',
          label: 'Username',
          required: true,
        },
      ],
    });

    return NextResponse.json({ checkout_url: checkout.checkout_url });
  }),
  {
    routeId: 'POST:/api/checkout',
  }
);

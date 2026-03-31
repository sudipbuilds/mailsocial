import { NextRequest, NextResponse } from 'next/server';

import config from '@/lib/config';
import { createDodopayments } from '@/lib/dodopayments';
import { withRateLimit } from '@/lib/rate-limit/with-rate-limit';

async function checkoutHandler(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withRateLimit(checkoutHandler, {
  routeId: 'POST:/api/checkout',
});

import { NextRequest, NextResponse } from 'next/server';

import config from '@/lib/config';
import { createDodopayments } from '@/lib/dodopayments';

export async function POST(request: NextRequest) {
  try {
    const dodoPayments = createDodopayments();

    const checkout = await dodoPayments.checkoutSessions.create({
      product_cart: [
        {
          product_id: config.dodopayments.productId,
          quantity: 1,
        },
      ],
      return_url: `${config.baseURL}/checkout`,
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

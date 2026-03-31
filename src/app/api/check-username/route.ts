import { and, eq, isNull } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { orders, users } from '@/db/schema';
import { usernameFormSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rate-limit/with-rate-limit';

async function checkUsernameHandler(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const validated = usernameFormSchema.safeParse(reqBody);
    if (!validated.success) {
      console.error(validated.error.issues[0].message);
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const db = await getD1Database();
    const { username } = validated.data;

    const [existingUser, pendingOrder] = await Promise.all([
      db.query.users.findFirst({
        where: eq(users.username, username),
      }),
      db.query.orders.findFirst({
        where: and(
          eq(orders.customerUsername, username),
          eq(orders.paymentStatus, 'succeeded'),
          isNull(orders.refundedAt)
        ),
      }),
    ]);

    const isAvailable = !existingUser && !pendingOrder;

    return NextResponse.json({ isAvailable });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const POST = withRateLimit(checkUsernameHandler, {
  routeId: 'POST:/api/check-username',
});

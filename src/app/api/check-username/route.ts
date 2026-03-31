import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { orders, users } from '@/db/schema';
import { usernameFormSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rateLimit/withRateLimit';
import { withApiContext } from '@/lib/api/withApiContext';

export const POST = withRateLimit(
  withApiContext(async (request, ctx) => {
    const reqBody = await request.json();
    const validated = usernameFormSchema.safeParse(reqBody);
    if (!validated.success) {
      return ctx.error.badRequest(validated.error.issues[0].message);
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
  }),
  {
    routeId: 'POST:/api/check-username',
  }
);

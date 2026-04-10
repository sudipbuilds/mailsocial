import { and, eq, desc, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { orders, users } from '@/db/schema';
import { currentUser } from '@/lib/current-user';
import { createDodopayments } from '@/lib/dodopayments';
import { sendAccountDeletedEmail } from '@/lib/mail';
import { deleteAccountSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rateLimit/withRateLimit';
import { withApiContext } from '@/lib/api/withApiContext';

const REFUND_ELIGIBLE_DAYS = 14;

export const DELETE = withRateLimit(
  withApiContext(async (request, ctx) => {
    const session = await currentUser();
    if (!session?.user) {
      return ctx.error.unauthorized();
    }

    const reqBody = await request.json();
    const validated = deleteAccountSchema.safeParse(reqBody);
    if (!validated.success) {
      return ctx.error.badRequest(validated.error.issues[0].message);
    }

    if (validated.data.username !== session.user.username) {
      return ctx.error.badRequest('Username does not match');
    }

    const db = await getD1Database();

    const createdAt = new Date(session.user.createdAt);
    const now = new Date();
    const daysSinceCreation = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const refundEligible = daysSinceCreation < REFUND_ELIGIBLE_DAYS;

    const order = await db.query.orders.findFirst({
      where: and(
        eq(orders.userId, session.user.id),
        eq(orders.customerUsername, session.user.username),
        eq(orders.paymentStatus, 'succeeded'),
        isNull(orders.refundedAt)
      ),
      orderBy: desc(orders.createdAt),
    });

    await db.delete(users).where(eq(users.id, session.user.id));
    ctx.log.info({ userId: session.user.id, refundEligible }, 'Account deleted');

    if (refundEligible && order) {
      ctx.log.info(
        { orderId: order.id, paymentId: order.paymentId },
        'Initiating refund for deleted account'
      );
      try {
        const dodo = createDodopayments();
        await dodo.refunds.create({
          payment_id: order.paymentId,
          reason: 'Account deletion refund',
        });
      } catch (error) {
        ctx.log.warn({ error }, 'Failed to refund order');
      }
    }

    await sendAccountDeletedEmail(session.user.email, session.user.name);

    return NextResponse.json({
      message: 'Account deleted successfully',
      refundEligible,
    });
  }),
  {
    routeId: 'DELETE:/api/account',
  }
);

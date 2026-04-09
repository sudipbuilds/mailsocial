import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { users } from '@/db/schema';
import { currentUser } from '@/lib/current-user';
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

    await db.delete(users).where(eq(users.id, session.user.id));

    await sendAccountDeletedEmail(session.user.email, session.user.name, refundEligible);

    return NextResponse.json({
      message: 'Account deleted successfully',
      refundEligible,
    });
  }),
  {
    routeId: 'DELETE:/api/account',
  }
);

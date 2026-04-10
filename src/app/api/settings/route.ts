import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { users } from '@/db/schema';
import { currentUser } from '@/lib/current-user';
import { settingsFormSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rateLimit/withRateLimit';
import { withApiContext } from '@/lib/api/withApiContext';

export const PATCH = withRateLimit(
  withApiContext(async (request, ctx) => {
    const session = await currentUser();
    if (!session?.user) {
      return ctx.error.unauthorized();
    }

    const reqBody = await request.json();
    const validated = settingsFormSchema.safeParse(reqBody);
    if (!validated.success) {
      return ctx.error.badRequest(validated.error.issues[0].message);
    }

    const { name, bio, website, isPrivate } = validated.data;
    const db = await getD1Database();

    await db
      .update(users)
      .set({
        name,
        bio: bio || null,
        website: website || null,
        isPrivate,
      })
      .where(eq(users.id, session.user.id));

    ctx.log.info({ userId: session.user.id }, 'Settings updated');
    return NextResponse.json({ message: 'Settings updated successfully' });
  }),
  {
    routeId: 'PATCH:/api/settings',
  }
);

import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { users } from '@/db/schema';
import { currentUser } from '@/lib/current-user';
import { settingsFormSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rate-limit/with-rate-limit';

async function settingsHandler(request: NextRequest) {
  try {
    const session = await currentUser();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqBody = await request.json();
    const validated = settingsFormSchema.safeParse(reqBody);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
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

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PATCH = withRateLimit(settingsHandler, {
  routeId: 'PATCH:/api/settings',
});

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import config from '@/lib/config';
import { getD1Database } from '@/db';
import { posts, users } from '@/db/schema';
import { postFormSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rateLimit/withRateLimit';
import { withApiContext } from '@/lib/api/withApiContext';

export const POST = withRateLimit(
  withApiContext(async (request, ctx) => {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token || token !== config.emailWorkerAPISecret) {
      ctx.log.warn('Post creation rejected: invalid bearer token');
      return ctx.error.unauthorized();
    }

    const reqBody = await request.json();
    const validated = postFormSchema.safeParse(reqBody);
    if (!validated.success) {
      return ctx.error.badRequest(validated.error.issues[0].message);
    }

    const { content, secretKey } = validated.data;

    const db = await getD1Database();
    const existingUser = await db.query.users.findFirst({
      where: eq(users.secretKey, secretKey),
    });
    if (!existingUser) {
      ctx.log.warn('Post creation rejected: invalid secret key');
      return ctx.error.badRequest('Invalid secret key');
    }

    await db.insert(posts).values({
      userId: existingUser.id,
      content,
    });

    ctx.log.info({ userId: existingUser.id }, 'Post created');
    return NextResponse.json({ message: 'Post created successfully' });
  }),
  {
    routeId: 'POST:/api/posts',
  }
);

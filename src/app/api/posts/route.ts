import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { posts, users } from '@/db/schema';
import { postFormSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1];
    if (!token || token !== process.env.API_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqBody = await request.json();
    const validated = postFormSchema.safeParse(reqBody);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const { content, secretKey } = validated.data;

    const db = await getD1Database();
    const existingUser = await db.query.users.findFirst({
      where: eq(users.secretKey, secretKey),
    });
    if (!existingUser) {
      return NextResponse.json({ error: 'Invalid secret key' }, { status: 400 });
    }

    await db.insert(posts).values({
      userId: existingUser.id,
      content,
    });

    return NextResponse.json({ message: 'Post created successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

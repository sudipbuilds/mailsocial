import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getDb } from '@/db';
import { users } from '@/db/schema';

const usernameSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).refine(
    value => {
      return /^[a-zA-Z0-9]+$/.test(value);
    },
    { message: 'Username not allowed. Try again.' }
  ),
});

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const validated = usernameSchema.safeParse(reqBody);
    if (!validated.success) {
      console.error(validated.error.issues[0].message);
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const { username } = validated.data;

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    return NextResponse.json({ isAvailable: !user });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

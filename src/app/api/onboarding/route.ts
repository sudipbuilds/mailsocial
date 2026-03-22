import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { users } from '@/db/schema';
import { createAuth } from '@/lib/auth/config';
import { generateRandomKey } from '@/lib/generate-key';
import { onboardingRequestSchema } from '@/lib/validations';

async function isKeyAvailable(
  db: Awaited<ReturnType<typeof getD1Database>>,
  key: string,
  currentUserId: string
): Promise<boolean> {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.secretKey, key),
  });
  return !existingUser || existingUser.id === currentUserId;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await createAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reqBody = await request.json();
    const validated = onboardingRequestSchema.safeParse(reqBody);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.issues[0].message }, { status: 400 });
    }

    const data = validated.data;
    const db = await getD1Database();

    // Handle key generation request
    if ('generate' in data && data.generate === true) {
      let finalKey: string;
      let attempts = 0;
      do {
        finalKey = generateRandomKey();
        attempts++;
        if (attempts > 10) {
          return NextResponse.json({ error: 'Failed to generate unique key' }, { status: 500 });
        }
      } while (!(await isKeyAvailable(db, finalKey, session.user.id)));

      return NextResponse.json({ secretKey: finalKey });
    }

    // Handle profile update
    if ('name' in data) {
      const { name, bio, image } = data;
      await db
        .update(users)
        .set({
          name,
          bio: bio || null,
          image: image || null,
        })
        .where(eq(users.id, session.user.id));

      return NextResponse.json({ success: true });
    }

    // Handle secret key save
    if ('secretKey' in data) {
      const { secretKey } = data;
      const available = await isKeyAvailable(db, secretKey, session.user.id);
      if (!available) {
        return NextResponse.json({ error: 'This key is already taken' }, { status: 400 });
      }

      await db.update(users).set({ secretKey }).where(eq(users.id, session.user.id));

      return NextResponse.json({ success: true, secretKey });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

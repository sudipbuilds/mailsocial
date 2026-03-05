import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { getDb } from '@/db';
import { users } from '@/db/schema';

export async function GET() {
  try {
    const cf = getCloudflareContext();
    const db = getDb(cf.env.D1_DATABASE);
    const result = await db.select().from(users);
    // const result = await db
    //   .insert(users)
    //   .values({ email: 'sudipbiswas2142@gmail.com', name: 'Sudip Biswas', emailVerified: true })
    //   .returning();
    return NextResponse.json({ message: 'Hello World', result });
  } catch (error) {
    console.error(error);
    return new NextResponse('Error', { status: 500 });
  }
}

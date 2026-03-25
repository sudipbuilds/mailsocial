import { and, desc, eq, lt } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { getD1Database } from '@/db';
import { posts, users } from '@/db/schema';
import { currentUser } from '@/lib/current-user';

const DEFAULT_LIMIT = 10;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 50);

    const db = await getD1Database();

    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        name: true,
        bio: true,
        website: true,
        username: true,
        isPrivate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await currentUser();
    const isOwnProfile = session?.user?.username === username;

    if (!isOwnProfile && user.isPrivate) {
      return NextResponse.json({
        user: {
          name: user.name,
          bio: user.bio,
          website: user.website,
          username: user.username,
          isPrivate: true,
        },
        posts: [],
        nextCursor: null,
        isOwnProfile: false,
      });
    }

    const userPosts = await db.query.posts.findMany({
      where: cursor
        ? and(eq(posts.userId, user.id), lt(posts.createdAt, new Date(cursor)))
        : eq(posts.userId, user.id),
      orderBy: [desc(posts.createdAt)],
      limit: limit + 1,
      columns: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    const hasMore = userPosts.length > limit;
    const postsToReturn = hasMore ? userPosts.slice(0, limit) : userPosts;
    const nextCursor = hasMore
      ? postsToReturn[postsToReturn.length - 1].createdAt.toISOString()
      : null;

    return NextResponse.json({
      user: {
        name: user.name,
        bio: user.bio,
        website: user.website,
        username: user.username,
        isPrivate: user.isPrivate,
      },
      posts: postsToReturn,
      nextCursor,
      isOwnProfile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

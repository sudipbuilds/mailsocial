import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import config from '@/lib/config';
import { PageWrapper } from '@/components/page-wrapper';
import { PostsList } from './components/posts-list';
import { UserMenu } from './components/user-menu';

interface UserResponse {
  user: {
    name: string;
    bio: string | null;
    website: string | null;
    username: string;
    isPrivate: boolean;
  };
  posts: { id: string; content: string; createdAt: string }[];
  nextCursor: string | null;
  isOwnProfile: boolean;
}

async function fetchUserData(username: string, cookie: string): Promise<UserResponse> {
  const baseUrl = config.url || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/users/${username}`, {
    headers: { cookie },
  });
  if (!res.ok) throw new Error('User not found');
  return res.json();
}

export default async function UserProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookie = (await headers()).get('cookie') ?? '';

  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchInfiniteQuery({
      queryKey: ['user', slug],
      queryFn: () => fetchUserData(slug, cookie),
      initialPageParam: undefined as string | undefined,
    });
  } catch {
    notFound();
  }

  const data = queryClient.getQueryData<{ pages: UserResponse[] }>(['user', slug]);
  const user = data?.pages?.[0]?.user;
  const isOwnProfile = data?.pages?.[0]?.isOwnProfile ?? false;

  if (!user) {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageWrapper
        outsideContent={isOwnProfile && <UserMenu name={user.name} username={user.username} />}
      >
        <header className="space-y-4 *:leading-tight">
          <h1 className="text-lg">{user.name}</h1>
          <div className="space-y-1">
            {user.bio && <p className="text-neutral-500">{user.bio}</p>}
            {user.website && (
              <Link
                href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:underline"
              >
                {user.website.replace(/^https?:\/\//, '')}
              </Link>
            )}
          </div>
        </header>

        {user.isPrivate && !isOwnProfile ? (
          <p className="text-neutral-500">This account is private.</p>
        ) : (
          <PostsList username={user.username} />
        )}
      </PageWrapper>
    </HydrationBoundary>
  );
}

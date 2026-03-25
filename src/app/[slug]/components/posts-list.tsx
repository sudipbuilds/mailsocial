'use client';

import { useEffect, useRef } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { SecretEmailCard } from '@/components/secret-email-card';

interface Post {
  id: string;
  content: string;
  createdAt: string;
}

interface UserResponse {
  user: {
    name: string;
    bio: string | null;
    website: string | null;
    username: string;
    isPrivate: boolean;
  };
  posts: Post[];
  nextCursor: string | null;
  isOwnProfile: boolean;
  secretKey?: string;
}

async function fetchUserPosts(username: string, cursor?: string): Promise<UserResponse> {
  const params = new URLSearchParams();
  if (cursor) params.set('cursor', cursor);

  const res = await fetch(`/api/users/${username}?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch posts');
  return res.json();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function PostsList({ username }: { username: string }) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ['user', username],
      queryFn: ({ pageParam }) => fetchUserPosts(username, pageParam),
      initialPageParam: undefined as string | undefined,
      getNextPageParam: lastPage => lastPage.nextCursor ?? undefined,
    });

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <p className="text-neutral-500">Loading...</p>;
  }

  if (isError) {
    return <p className="text-neutral-500">Failed to load posts.</p>;
  }

  const allPosts = data?.pages.flatMap(page => page.posts) ?? [];

  if (allPosts.length === 0) {
    const isOwnProfile = data?.pages?.[0]?.isOwnProfile;
    const secretKey = data?.pages?.[0]?.secretKey;

    if (isOwnProfile && secretKey) {
      return (
        <div className="space-y-4">
          <SecretEmailCard secretKey={secretKey} />
          <p className="text-neutral-500">No posts yet.</p>
        </div>
      );
    }
    return <p className="text-neutral-500">No posts yet.</p>;
  }

  return (
    <div className="space-y-12">
      {allPosts.map(post => (
        <article key={post.id} className="space-y-3">
          <p>{post.content}</p>
          <p className="text-neutral-400 text-sm">{formatDate(post.createdAt)}</p>
        </article>
      ))}
      <div ref={loadMoreRef} className="h-4" />
    </div>
  );
}

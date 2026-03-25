'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth/client';

export function UserMenu({ name, username }: { name: string; username: string }) {
  const router = useRouter();

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/');
  }

  return (
    <div className="fixed bottom-4 left-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="User menu"
            className="border border-border rounded-full bg-neutral-200/75 text-secondary-foreground size-8 inline-flex items-center justify-center"
          >
            <Menu className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <Link href={`/${username}`} className="tracking-tight">
              {name}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings" className="tracking-tight">
              Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="tracking-tight" onClick={handleSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

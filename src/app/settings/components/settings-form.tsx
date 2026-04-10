'use client';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { User } from '@/lib/auth/config';
import {
  settingsFormSchema,
  deleteAccountSchema,
  type SettingsFormInput,
  type DeleteAccountInput,
} from '@/lib/validations';
import { authClient } from '@/lib/auth/client';

export function SettingsForm({ defaultValues }: { defaultValues: Partial<User> }) {
  const router = useRouter();

  const form = useForm<SettingsFormInput>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      name: defaultValues.name,
      bio: defaultValues.bio || '',
      website: defaultValues.website || '',
      isPrivate: defaultValues.isPrivate || false,
    },
  });

  const deleteForm = useForm<DeleteAccountInput>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      username: '',
    },
  });

  const isLoading = form.formState.isSubmitting;
  const isDeleting = deleteForm.formState.isSubmitting;
  const errors = form.formState.errors;
  const deleteErrors = deleteForm.formState.errors;

  async function handleSubmit(data: SettingsFormInput) {
    try {
      await axios.patch('/api/settings', data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        form.setError('root', {
          message: error.response?.data?.error || 'Something went wrong.',
        });
      } else {
        form.setError('root', {
          message: 'An unexpected error occurred.',
        });
      }
    }
  }

  async function handleDelete(data: DeleteAccountInput) {
    try {
      await axios.delete('/api/account', { data });
      await authClient.signOut();
      router.push('/');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        deleteForm.setError('root', {
          message: error.response?.data?.error || 'Something went wrong.',
        });
      } else {
        deleteForm.setError('root', {
          message: 'An unexpected error occurred.',
        });
      }
    }
  }

  const deleteUsername = deleteForm.watch('username');
  const usernameMatches = deleteUsername === defaultValues.username;

  return (
    <>
      <form className="space-y-8" onSubmit={form.handleSubmit(handleSubmit)}>
        {errors.root && <p className="text-muted-foreground/75">{errors.root.message}</p>}

        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm text-muted-foreground">
              Name
            </label>
            {errors.name && (
              <p className="text-sm text-muted-foreground/75">{errors.name.message}</p>
            )}
            <input
              {...form.register('name')}
              id="name"
              type="text"
              placeholder="Your name"
              className={cn(
                'w-full outline-none bg-transparent placeholder:text-muted-foreground/75',
                isLoading && 'cursor-not-allowed text-muted-foreground'
              )}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm text-muted-foreground">
              Bio
            </label>
            {errors.bio && <p className="text-sm text-muted-foreground/75">{errors.bio.message}</p>}
            <input
              {...form.register('bio')}
              id="bio"
              type="text"
              placeholder="A short bio"
              className={cn(
                'w-full outline-none bg-transparent placeholder:text-muted-foreground/75',
                isLoading && 'cursor-not-allowed text-muted-foreground'
              )}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-sm text-muted-foreground">
              Website
            </label>
            {errors.website && (
              <p className="text-sm text-muted-foreground/75">{errors.website.message}</p>
            )}
            <input
              {...form.register('website')}
              id="website"
              type="text"
              placeholder="https://example.com"
              className={cn(
                'w-full outline-none bg-transparent placeholder:text-muted-foreground/75',
                isLoading && 'cursor-not-allowed text-muted-foreground'
              )}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isPrivate"
              checked={form.watch('isPrivate')}
              onCheckedChange={checked => form.setValue('isPrivate', !!checked)}
              disabled={isLoading}
            />
            <label htmlFor="isPrivate" className="text-sm text-muted-foreground">
              Private account
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'text-sm text-muted-foreground/75 hover:text-muted-foreground',
            isLoading && 'cursor-not-allowed'
          )}
        >
          Save changes
        </button>
      </form>

      <form
        className="pt-8 border-t border-border"
        onSubmit={deleteForm.handleSubmit(handleDelete)}
      >
        <h2 className="text-lg mb-4">Delete Account</h2>

        <div className="space-y-2">
          {deleteErrors.username && (
            <p className="text-sm text-muted-foreground/75">{deleteErrors.username.message}</p>
          )}
          <input
            {...deleteForm.register('username')}
            id="username-delete"
            type="text"
            placeholder="Type your username to confirm"
            className={cn(
              'w-full outline-none bg-transparent placeholder:text-muted-foreground/75',
              isDeleting && 'cursor-not-allowed text-muted-foreground'
            )}
            disabled={isDeleting}
          />
        </div>

        {deleteErrors.root && (
          <p className="text-sm text-muted-foreground/75 mt-2">{deleteErrors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={!usernameMatches || isDeleting}
          className={cn(
            'text-sm text-muted-foreground/75 hover:text-muted-foreground mt-4',
            (!usernameMatches || isDeleting) && 'cursor-not-allowed'
          )}
        >
          {isDeleting ? 'Deleting...' : 'Delete account'}
        </button>
      </form>
    </>
  );
}

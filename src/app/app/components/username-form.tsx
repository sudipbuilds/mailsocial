'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useTransition } from 'react';

import { cn } from '@/lib/utils';

const formSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).refine(
    value => {
      return /^[a-zA-Z0-9]+$/.test(value);
    },
    { message: 'Username not allowed. Try again.' }
  ),
});

type FormData = z.infer<typeof formSchema>;

export const UsernameForm = () => {
  const [step, setStep] = useState<'username' | 'available'>('username');
  const [isTransitioning, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  const isUsernameFormLoading = form.formState.isSubmitting;
  const usernameFormErrors = form.formState.errors.username;

  async function handleSubmit({ username }: FormData) {
    try {
      // check if username is available
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep('available');
    } catch (error) {
      console.error(error);
      form.setError('username', { message: 'Username not available. Try again.' });
    }
  }

  function handleCheckout() {
    startTransition(async () => {
      try {
        console.log('checkout started');
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('checkout finished');
      } catch (error) {
        console.error(error);
      }
    });
  }

  const renderForm = useMemo(() => {
    switch (step) {
      case 'username':
        return (
          <div className="space-y-6">
            <p>Create your username. Use only letters and numbers, then hit Enter to submit.</p>
            <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
              {usernameFormErrors && (
                <p className="text-muted-foreground/75">{usernameFormErrors.message}</p>
              )}
              <div
                className={cn(
                  'flex items-center',
                  isUsernameFormLoading && 'text-muted-foreground'
                )}
              >
                <label
                  htmlFor="username"
                  className={cn(isUsernameFormLoading && 'cursor-not-allowed')}
                >
                  antisocial.com/
                </label>
                <input
                  {...form.register('username')}
                  type="text"
                  inputMode="text"
                  autoComplete="username"
                  placeholder="username"
                  className={cn(
                    'outline-none flex-1 bg-transparent placeholder:text-muted-foreground/75',
                    isUsernameFormLoading && 'cursor-not-allowed'
                  )}
                  disabled={isUsernameFormLoading}
                />
              </div>
            </form>
          </div>
        );
      case 'available':
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <p>Your username is available:</p>
              <p>{form.getValues('username')}</p>
              <p>
                Please copy your username, as you will be required to provide it during the ordering
                process.
              </p>
            </div>
            <button
              disabled={isTransitioning}
              onClick={handleCheckout}
              className={cn(
                'px-4 py-2 rounded-full bg-neutral-200/75 text-sm text-secondary-foreground outline-none inline-flex items-center justify-center',
                isTransitioning && 'text-muted-foreground bg-neutral-200/50 cursor-not-allowed'
              )}
            >
              Continue to payment / $10*
            </button>
            <p className="text-muted-foreground/75 text-sm leading-tight">
              *Forever Plan: Pay a one-time fee of $20 for ongoing access, ensuring you enjoy Daft
              Social for as long as it lasts, without any additional costs.
            </p>
          </div>
        );
      default:
        return null;
    }
  }, [step, isTransitioning, usernameFormErrors, isUsernameFormLoading]);

  return <>{renderForm}</>;
};

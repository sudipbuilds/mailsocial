'use client';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState, useTransition } from 'react';

import { cn } from '@/lib/utils';
import config from '@/lib/config';
import { type UsernameFormInput, usernameFormSchema } from '@/lib/validations';

export const UsernameForm = () => {
  const [step, setStep] = useState<'username' | 'available'>('username');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  const form = useForm<UsernameFormInput>({
    resolver: zodResolver(usernameFormSchema),
    defaultValues: {
      username: '',
    },
  });

  const isUsernameFormLoading = form.formState.isSubmitting;
  const usernameFormErrors = form.formState.errors.username;

  async function handleSubmit({ username }: UsernameFormInput) {
    try {
      const res = await axios.post('/api/check-username', { username });
      if (res.data.isAvailable) {
        setStep('available');
      } else {
        form.setError('username', { message: 'Username not available. Try again.' });
      }
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        form.setError('username', { message: error.response.data.error });
      } else {
        form.setError('username', { message: 'Username not available. Try again.' });
      }
    }
  }

  function handleCheckout() {
    startTransition(async () => {
      try {
        const res = await axios.post('/api/checkout');
        if (res.data.checkout_url) {
          window.location.href = res.data.checkout_url;
        } else {
          setCheckoutError('Something went wrong. Please try again.');
        }
      } catch (error) {
        console.error(error);
        if (axios.isAxiosError(error) && error.response?.data?.error) {
          setCheckoutError(error.response.data.error);
        } else {
          setCheckoutError('Something went wrong. Please try again.');
        }
      }
    });
  }

  const renderForm = useMemo(() => {
    switch (step) {
      case 'username':
        return (
          <div className="space-y-8">
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
                  {config.domain}/
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
          <div className="space-y-12">
            <div className="space-y-6">
              <p>Your username is available:</p>
              <p>{form.getValues('username')}</p>
              <p>
                Please copy your username, as you will be required to provide it during the ordering
                process.
              </p>
            </div>
            {checkoutError && <p className="text-muted-foreground/75">{checkoutError}</p>}
            <button
              disabled={isTransitioning}
              onClick={handleCheckout}
              className={cn(
                'px-4 py-2 rounded-full bg-neutral-200/75 text-sm text-secondary-foreground outline-none inline-flex items-center justify-center',
                isTransitioning && 'text-muted-foreground bg-neutral-200/50 cursor-not-allowed'
              )}
            >
              Continue to payment / $15*
            </button>
            <p className="text-muted-foreground/75 text-sm leading-tight">
              *Forever Plan: Pay a one-time fee of $15 for ongoing access, ensuring you enjoy
              MailSocial for as long as it lasts, without any additional costs.
            </p>
          </div>
        );
      default:
        return null;
    }
  }, [step, isTransitioning, usernameFormErrors, isUsernameFormLoading]);

  return <>{renderForm}</>;
};

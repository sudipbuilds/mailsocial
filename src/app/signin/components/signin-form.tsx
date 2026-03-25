'use client';

import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  emailFormSchema,
  otpFormSchema,
  type EmailFormInput,
  type OtpFormInput,
} from '@/lib/validations';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth/client';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email.slice(0, 4) + '***';
  const visiblePart = local.slice(0, 4);
  return `${visiblePart}***@${domain}`;
}

export const SignInForm = ({ email }: { email?: string }) => {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>(email ? 'otp' : 'email');
  const [currentEmail, setCurrentEmail] = useState(email || '');
  const [sendError, setSendError] = useState<string | null>(null);
  const hasSentInitialOtp = useRef(false);

  const emailForm = useForm<EmailFormInput>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: email || '',
    },
  });

  const otpForm = useForm<OtpFormInput>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: '',
    },
  });

  const isEmailFormLoading = emailForm.formState.isSubmitting;
  const emailFormErrors = emailForm.formState.errors.email;
  const isOtpFormLoading = otpForm.formState.isSubmitting;
  const otpFormErrors = otpForm.formState.errors.otp;

  async function sendVerification(emailToSend: string) {
    setSendError(null);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: emailToSend,
      type: 'sign-in',
    });
    if (error) {
      setSendError(error.message || 'Failed to send verification code.');
      return false;
    }
    return true;
  }

  useEffect(() => {
    if (email && !hasSentInitialOtp.current) {
      hasSentInitialOtp.current = true;
      sendVerification(email);
    }
  }, [email]);

  async function handleEmailSubmit({ email: submittedEmail }: EmailFormInput) {
    const success = await sendVerification(submittedEmail);
    if (success) {
      setCurrentEmail(submittedEmail);
      setStep('otp');
    }
  }

  async function handleOtpSubmit({ otp }: OtpFormInput) {
    try {
      const response = await axios.post('/api/signin', { email: currentEmail, otp });
      const { username } = response.data;
      router.push(`/${username}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        otpForm.setError('otp', {
          message: error.response?.data?.error || 'Invalid OTP. Please try again.',
        });
      }
    }
  }

  async function handleResendOtp() {
    otpForm.reset();
    await sendVerification(currentEmail);
  }

  function handleBackToEmail() {
    otpForm.reset();
    setSendError(null);
    setStep('email');
  }

  const renderForm = useMemo(() => {
    switch (step) {
      case 'email':
        return (
          <div className="space-y-6">
            <p>Enter your email address to sign in.</p>
            <form className="space-y-6" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
              {(emailFormErrors || sendError) && (
                <p className="text-muted-foreground/75">{emailFormErrors?.message || sendError}</p>
              )}
              <div
                className={cn('flex items-center', isEmailFormLoading && 'text-muted-foreground')}
              >
                <input
                  {...emailForm.register('email')}
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={cn(
                    'outline-none flex-1 bg-transparent placeholder:text-muted-foreground/75',
                    isEmailFormLoading && 'cursor-not-allowed'
                  )}
                  disabled={isEmailFormLoading}
                />
              </div>
            </form>
          </div>
        );
      case 'otp':
        return (
          <div className="space-y-6">
            <p>Enter the 6-digit code sent to {maskEmail(currentEmail)}</p>
            <form className="space-y-6" onSubmit={otpForm.handleSubmit(handleOtpSubmit)}>
              {(otpFormErrors || sendError) && (
                <p className="text-muted-foreground/75">{otpFormErrors?.message || sendError}</p>
              )}
              <div className={cn('flex items-center', isOtpFormLoading && 'text-muted-foreground')}>
                <input
                  {...otpForm.register('otp')}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="******"
                  maxLength={6}
                  className={cn(
                    'outline-none flex-1 bg-transparent placeholder:text-muted-foreground/75',
                    isOtpFormLoading && 'cursor-not-allowed'
                  )}
                  disabled={isOtpFormLoading}
                />
              </div>
            </form>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleBackToEmail}
                disabled={isOtpFormLoading}
                className={cn(
                  'text-sm text-muted-foreground/75 hover:text-muted-foreground',
                  isOtpFormLoading && 'cursor-not-allowed'
                )}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isOtpFormLoading}
                className={cn(
                  'text-sm text-muted-foreground/75 hover:text-muted-foreground',
                  isOtpFormLoading && 'cursor-not-allowed'
                )}
              >
                Resend code
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [
    step,
    isEmailFormLoading,
    isOtpFormLoading,
    emailFormErrors,
    otpFormErrors,
    sendError,
    currentEmail,
  ]);

  return <>{renderForm}</>;
};

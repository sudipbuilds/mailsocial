'use client';

import Link from 'next/link';
import { useCallback } from 'react';

export const OrderStatus = ({
  status,
  email,
  payment_id,
}: {
  status: string;
  email: string;
  payment_id: string;
}) => {
  const renderContent = useCallback(() => {
    switch (status) {
      case 'succeeded':
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h1>Payment successful!</h1>
              <p>
                Your payment has been successful. You can now login to your account and start using
                MailSocial.
              </p>
            </div>
            <Link
              href={`/signin?email=${email}`}
              className="px-4 py-2 rounded-full bg-neutral-200/75 text-sm font-medium outline-none inline-flex items-center justify-center"
            >
              Login to your account
            </Link>
          </div>
        );
      case 'failed':
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h1>Payment failed!</h1>
              <p>
                Your payment has failed. Please try again or contact support if the problem
                persists.
              </p>
            </div>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-full bg-neutral-200/75 text-sm font-medium outline-none inline-flex items-center justify-center"
            >
              Go back and try again
            </Link>
          </div>
        );
      case 'cancelled':
        return (
          <div className="space-y-8">
            <div className="space-y-6">
              <h1>Payment cancelled!</h1>
              <p>
                Your payment has been cancelled. You can try again or contact support if the problem
                persists.
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-full bg-neutral-200/75 text-sm font-medium outline-none inline-flex items-center justify-center"
            >
              Go back to home
            </Link>
          </div>
        );
    }
  }, [status, email, payment_id]);

  return renderContent();
};

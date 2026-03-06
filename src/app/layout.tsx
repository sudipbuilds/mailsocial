import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';

const fontSans = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Antisocial',
  description: 'The most antisocial social media application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
      </head>
      <body className={cn(fontSans.variable, 'font-sans antialiased')}>{children}</body>
    </html>
  );
}

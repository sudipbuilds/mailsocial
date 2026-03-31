import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';
import config from '@/lib/config';
import { Providers } from '@/components/providers';

const fontSans = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 3,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  userScalable: true,
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: {
    default: config.appName,
    template: `%s - ${config.appName}`,
  },
  description: config.description,
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  keywords: [],
  authors: {
    name: config.author.name,
    url: config.author.url,
  },
  creator: config.author.username,
  applicationName: config.appName,
  metadataBase: new URL(config.url),
  publisher: config.author.name,
  openGraph: {
    type: 'website',
    title: config.appName,
    description: config.description,
    url: config.url,
    siteName: config.appName,
    locale: 'en_US',
    images: [config.ogImage],
  },
  twitter: {
    title: config.appName,
    description: config.description,
    card: 'summary_large_image',
    creator: config.author.username,
    site: config.url,
    images: [config.ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(fontSans.variable, 'font-sans antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

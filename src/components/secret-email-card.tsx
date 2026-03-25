'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

import config from '@/lib/config';

interface SecretEmailCardProps {
  secretKey: string;
}

export function SecretEmailCard({ secretKey }: SecretEmailCardProps) {
  const [copied, setCopied] = useState(false);
  const email = `${secretKey}@${config.domain}`;

  async function copyToClipboard() {
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">Your secret email address</p>
      <div className="flex items-center gap-2">
        <p>{email}</p>
        <button onClick={copyToClipboard} aria-label="Copy email">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}

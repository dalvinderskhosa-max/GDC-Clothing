'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  variant?: 'dark' | 'light';
  withPhone?: boolean;
  source?: string;
  onSuccess?: () => void;
};

export default function NewsletterForm({
  variant = 'light',
  withPhone = false,
  source = 'footer',
  onSuccess,
}: Props) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const dark = variant === 'dark';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: withPhone ? phone : undefined, source }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.existing ? "You're already on the list — welcome back." : "You're in. Watch your inbox.");
        onSuccess?.();
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <p
        className={cn(
          'text-xl uppercase tracking-brand',
          dark ? 'text-ink' : 'text-bone',
        )}
      >
        ✓ {message}
      </p>
    );
  }

  const inputBase = cn(
    'w-full border px-4 py-3 text-sm outline-none transition-colors placeholder:uppercase placeholder:tracking-brand placeholder:text-current/50',
    dark
      ? 'border-white/25 bg-transparent text-ink focus:border-steel'
      : 'border-steel bg-transparent text-bone focus:border-bone',
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className={cn('gap-3', withPhone ? 'space-y-3' : 'sm:flex')}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address"
          className={inputBase}
          autoComplete="email"
        />
        {withPhone && (
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className={inputBase}
            autoComplete="tel"
          />
        )}
        <button
          type="submit"
          disabled={status === 'loading'}
          className={cn(
            'whitespace-nowrap px-8 py-3 text-sm font-semibold uppercase tracking-brand transition-colors disabled:opacity-60',
            withPhone ? 'w-full' : 'mt-3 w-full sm:mt-0 sm:w-auto',
            dark
              ? 'bg-ink text-bone hover:bg-signal hover:text-ink'
              : 'bg-bone text-ink hover:bg-signal',
          )}
        >
          {status === 'loading' ? 'Joining…' : 'Sign up'}
        </button>
      </div>
      {status === 'error' && (
        <p className={cn('text-xs', dark ? 'text-signal' : 'text-red-700')}>{message}</p>
      )}
      <p className={cn('text-[11px]', dark ? 'text-white/40' : 'text-mist')}>
        By signing up you agree to receive marketing emails{withPhone ? ' and SMS' : ''} from GDC Clothing.
      </p>
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import NewsletterForm from './newsletter-form';

const STORAGE_KEY = 'gdc_popup_seen';
const DELAY_MS = 7000;

export default function LeadPopup() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    let done = false;
    const trigger = () => {
      if (done) return;
      done = true;
      setOpen(true);
    };

    const timer = window.setTimeout(trigger, DELAY_MS);

    // Exit-intent (desktop): mouse leaves toward the top of the viewport
    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger();
    };
    document.addEventListener('mouseout', onMouseOut);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Join the GDC list"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
      />

      <div className="relative z-10 grid w-full max-w-3xl animate-fade-in overflow-hidden bg-paper shadow-2xl md:grid-cols-2">
        {/* Visual side */}
        <div className="relative hidden bg-ink md:block">
          <div className="flex h-full flex-col justify-between p-8 text-paper">
            <span className="font-display text-3xl uppercase tracking-[0.2em]">GDC</span>
            <div>
              <p className="font-display text-6xl uppercase leading-none tracking-brand">
                10%
                <br />
                OFF
              </p>
              <p className="mt-3 text-sm text-white/70">Your first order.</p>
            </div>
            <p className="text-[11px] uppercase tracking-brand text-white/40">
              Money oriented. Grind focused.
            </p>
          </div>
        </div>

        {/* Form side */}
        <div className="relative p-8 sm:p-10">
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 text-2xl leading-none text-ink/60 hover:text-ink"
          >
            &times;
          </button>

          <h2 className="font-display text-3xl uppercase tracking-brand sm:text-4xl">
            Unlock 10% off
          </h2>
          <p className="mb-6 mt-2 text-sm text-smoke">
            Join the GDC list for early drops, exclusive offers and 10% off your first
            order. Drop your email and number to lock it in.
          </p>

          {!dismissed && (
            <NewsletterForm
              variant="light"
              withPhone
              source="welcome-popup"
              onSuccess={() => {
                setDismissed(true);
                try {
                  localStorage.setItem(STORAGE_KEY, '1');
                } catch {
                  /* ignore */
                }
              }}
            />
          )}

          <button
            onClick={close}
            className="mt-4 text-[11px] uppercase tracking-brand text-smoke underline underline-offset-2 hover:text-ink"
          >
            No thanks, I&apos;ll pay full price
          </button>
        </div>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Money } from './shopify/types';

export function formatMoney(money: Money | undefined | null): string {
  if (!money) return '';
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: money.currencyCode,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${money.currencyCode} ${amount.toFixed(2)}`;
  }
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Shopify's rich-text editor bakes inline styles and theme classes into page
 * and article bodies — centred text, hard-coded colours, foreign font stacks.
 * On a dark, left-aligned design system that content fights the page, so the
 * presentation attributes are stripped and the prose styles below take over.
 * Only formatting is removed; the markup and copy are left intact.
 */
export function cleanShopifyHtml(html: string): string {
  return (
    html
      // Page bodies ship an entire embedded stylesheet — its own palette, font
      // stack and centred layout — plus :root overrides that leak site-wide.
      // With the class attributes stripped below, that CSS matches nothing
      // anyway; left in place it only pollutes the cascade.
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      // The page header already renders the title, so a body h1 duplicates it.
      .replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '')
      .replace(/\s(?:style|class|align|bgcolor|width|height)="[^"]*"/gi, '')
      .replace(/\s(?:style|class|align|bgcolor|width|height)='[^']*'/gi, '')
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      // Empty wrappers left behind once their styling is gone.
      .replace(/<(div|span)>\s*<\/\1>/gi, '')
      .trim()
  );
}

/** Shared prose styling for merchant-authored HTML. */
export const PROSE = [
  'max-w-2xl text-[15px] leading-relaxed text-mist',
  // First paragraph reads as a standfirst rather than body copy.
  '[&>p:first-of-type]:text-[clamp(1.05rem,1.9vw,1.35rem)] [&>p:first-of-type]:leading-[1.55] [&>p:first-of-type]:text-bone [&>p:first-of-type]:mb-8',
  '[&_p]:mb-5',
  '[&_h1]:mt-14 [&_h1]:mb-5 [&_h1]:text-3xl [&_h1]:uppercase [&_h1]:leading-none [&_h1]:tracking-tight [&_h1]:text-bone',
  '[&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:leading-none [&_h2]:tracking-tight [&_h2]:text-bone',
  '[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:text-base [&_h3]:uppercase [&_h3]:tracking-brand [&_h3]:text-bone',
  '[&_strong]:font-semibold [&_strong]:text-bone',
  '[&_em]:italic',
  '[&_a]:text-bone [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-signal',
  '[&_ul]:my-5 [&_ol]:my-5',
  '[&_li]:mb-2 [&_li]:ml-5 [&_ul>li]:list-disc [&_ol>li]:list-decimal',
  '[&_img]:my-9 [&_img]:w-full',
  '[&_hr]:my-12 [&_hr]:border-steel',
  '[&_blockquote]:my-8 [&_blockquote]:border-l [&_blockquote]:border-signal [&_blockquote]:pl-6 [&_blockquote]:text-bone',
  '[&_table]:my-8 [&_table]:w-full [&_td]:border [&_td]:border-steel [&_td]:p-3 [&_th]:border [&_th]:border-steel [&_th]:p-3 [&_th]:text-left [&_th]:text-bone',
].join(' ');

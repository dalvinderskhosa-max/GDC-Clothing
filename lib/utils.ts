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

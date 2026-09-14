'use server';

import { cookies } from 'next/headers';
import {
  addToCart,
  createCart,
  getCart,
  MARKET_COUNTRY,
  removeFromCart,
  setCartCountry,
  updateCart,
} from '@/lib/shopify';
import type { Cart } from '@/lib/shopify/types';

const CART_COOKIE = 'gdc_cartId';

type CartResult = { cart: Cart } | { error: string };

function rememberCart(cart: Cart) {
  cookies().set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

/**
 * Bring a cart back to a usable state.
 *
 * A cart minted before the market was pinned may sit in a country the shop
 * does not sell to; Shopify then holds every line at quantity 0 and rejects
 * nothing, so the shopper just sees dead +/- buttons. Move it into our market,
 * then put one of each zeroed line back — they were things the shopper chose.
 * Anything genuinely sold out stays at 0 (Shopify re-zeroes it, no error) and
 * the drawer says so.
 */
async function heal(cart: Cart): Promise<Cart> {
  try {
    let next = cart;
    const country = next.buyerIdentity?.countryCode;
    if (country && country !== MARKET_COUNTRY) next = await setCartCountry(next.id);
    const zeroed = next.lines
      .filter((l) => l.quantity === 0)
      .map((l) => ({ id: l.id, quantity: 1 }));
    if (zeroed.length) next = await updateCart(next.id, zeroed);
    return next;
  } catch (e) {
    console.error('[cart] could not heal cart', e);
    return cart;
  }
}

/** The shopper's existing cart, or null. Never creates one. */
async function existingCart(): Promise<Cart | null> {
  const cartId = cookies().get(CART_COOKIE)?.value;
  if (!cartId) return null;
  const cart = await getCart(cartId);
  return cart ? heal(cart) : null;
}

/** The shopper's cart, creating one only when there is nothing to reuse. */
async function resolveCart(): Promise<Cart> {
  const existing = await existingCart();
  if (existing) return existing;
  const cart = await createCart();
  rememberCart(cart);
  return cart;
}

function failed(e: unknown, fallback: string): { error: string } {
  console.error('[cart]', e);
  return { error: e instanceof Error ? e.message : fallback };
}

export async function getCartAction(): Promise<Cart | null> {
  try {
    return await existingCart();
  } catch (e) {
    console.error('[cart] getCart', e);
    return null;
  }
}

export async function addItemAction(merchandiseId: string, quantity = 1): Promise<CartResult> {
  try {
    const cart = await resolveCart();
    return { cart: await addToCart(cart.id, [{ merchandiseId, quantity }]) };
  } catch (e) {
    return failed(e, 'Failed to add item');
  }
}

/**
 * Quantity changes and removals act on the cart the line belongs to. If that
 * cart has gone (expired, checked out) there is nothing to update — minting
 * a fresh cart here would only produce "line does not exist" from Shopify.
 */
export async function updateItemQuantityAction(lineId: string, quantity: number): Promise<CartResult> {
  try {
    const cart = await existingCart();
    if (!cart) return { error: 'Your bag has expired. Please add the item again.' };
    if (quantity <= 0) return { cart: await removeFromCart(cart.id, [lineId]) };
    return { cart: await updateCart(cart.id, [{ id: lineId, quantity }]) };
  } catch (e) {
    return failed(e, 'Failed to update item');
  }
}

export async function removeItemAction(lineId: string): Promise<CartResult> {
  try {
    const cart = await existingCart();
    if (!cart) return { error: 'Your bag has expired.' };
    return { cart: await removeFromCart(cart.id, [lineId]) };
  } catch (e) {
    return failed(e, 'Failed to remove item');
  }
}

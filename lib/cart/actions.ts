'use server';

import { cookies } from 'next/headers';
import {
  addToCart,
  createCart,
  getCart,
  removeFromCart,
  updateCart,
} from '@/lib/shopify';
import type { Cart } from '@/lib/shopify/types';

const CART_COOKIE = 'gdc_cartId';

async function resolveCart(): Promise<Cart> {
  const cartId = cookies().get(CART_COOKIE)?.value;
  if (cartId) {
    const existing = await getCart(cartId);
    if (existing) return existing;
  }
  const cart = await createCart();
  cookies().set(CART_COOKIE, cart.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return cart;
}

export async function getCartAction(): Promise<Cart | null> {
  const cartId = cookies().get(CART_COOKIE)?.value;
  if (!cartId) return null;
  return getCart(cartId);
}

export async function addItemAction(
  merchandiseId: string,
  quantity = 1,
): Promise<{ cart: Cart } | { error: string }> {
  try {
    const cart = await resolveCart();
    const updated = await addToCart(cart.id, [{ merchandiseId, quantity }]);
    return { cart: updated };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to add item' };
  }
}

export async function updateItemQuantityAction(
  lineId: string,
  merchandiseId: string,
  quantity: number,
): Promise<{ cart: Cart } | { error: string }> {
  try {
    const cart = await resolveCart();
    if (quantity <= 0) {
      const updated = await removeFromCart(cart.id, [lineId]);
      return { cart: updated };
    }
    const updated = await updateCart(cart.id, [
      { id: lineId, merchandiseId, quantity },
    ]);
    return { cart: updated };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to update item' };
  }
}

export async function removeItemAction(
  lineId: string,
): Promise<{ cart: Cart } | { error: string }> {
  try {
    const cart = await resolveCart();
    const updated = await removeFromCart(cart.id, [lineId]);
    return { cart: updated };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to remove item' };
  }
}

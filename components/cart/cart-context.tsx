'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Cart } from '@/lib/shopify/types';
import {
  addItemAction,
  getCartAction,
  removeItemAction,
  updateItemQuantityAction,
} from '@/lib/cart/actions';

type CartContextValue = {
  cart: Cart | null;
  isOpen: boolean;
  /** A line mutation is in flight — the drawer disables its controls. */
  isPending: boolean;
  /** Last failure from a line mutation, cleared on the next success. */
  error: string | null;
  /** Shopify applied the last change only partially — e.g. "Only 1 available". */
  notice: string | null;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  // Line mutations are serialised: a second click while one is in flight is
  // dropped rather than racing it and applying quantities out of order.
  const busy = useRef(false);

  useEffect(() => {
    getCartAction()
      .then((c) => c && setCart(c))
      .catch((e) => console.error('[cart] hydrate', e));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(async (merchandiseId: string, quantity = 1) => {
    try {
      const res = await addItemAction(merchandiseId, quantity);
      if ('cart' in res) {
        setCart(res.cart);
        setError(null);
        setNotice(res.cart.warnings?.join(' ') ?? null);
        setIsOpen(true);
        return true;
      }
      console.error('[cart] add', res.error);
      return false;
    } catch (e) {
      console.error('[cart] add', e);
      return false;
    }
  }, []);

  /**
   * Run a line mutation and reconcile state with whatever the server says.
   * `useTransition` was previously used here, but React 18 does not support
   * async transition callbacks: a failed action became an unhandled rejection
   * and the UI never changed, which is exactly the "dead button" a shopper
   * reported. A plain async call with explicit pending/error state is honest.
   */
  const mutate = useCallback(
    async (run: () => Promise<{ cart: Cart } | { error: string }>) => {
      if (busy.current) return;
      busy.current = true;
      setIsPending(true);
      try {
        const res = await run();
        if ('cart' in res) {
          setCart(res.cart);
          setError(null);
          setNotice(res.cart.warnings?.join(' ') ?? null);
        } else {
          console.error('[cart]', res.error);
          setError(res.error);
          // Resync with the server so the drawer never shows a stale line.
          const fresh = await getCartAction().catch(() => null);
          setCart(fresh);
        }
      } catch (e) {
        console.error('[cart]', e);
        setError('Something went wrong updating your bag. Please try again.');
      } finally {
        busy.current = false;
        setIsPending(false);
      }
    },
    [],
  );

  const updateQuantity = useCallback(
    (lineId: string, quantity: number) =>
      mutate(() => updateItemQuantityAction(lineId, quantity)),
    [mutate],
  );

  const removeItem = useCallback(
    (lineId: string) => mutate(() => removeItemAction(lineId)),
    [mutate],
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isPending,
        error,
        notice,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

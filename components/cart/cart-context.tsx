'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
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
  isPending: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (merchandiseId: string, quantity?: number) => Promise<boolean>;
  updateQuantity: (
    lineId: string,
    merchandiseId: string,
    quantity: number,
  ) => void;
  removeItem: (lineId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCartAction().then((c) => c && setCart(c));
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const addItem = useCallback(
    async (merchandiseId: string, quantity = 1) => {
      const res = await addItemAction(merchandiseId, quantity);
      if ('cart' in res) {
        setCart(res.cart);
        setIsOpen(true);
        return true;
      }
      return false;
    },
    [],
  );

  const updateQuantity = useCallback(
    (lineId: string, merchandiseId: string, quantity: number) => {
      startTransition(async () => {
        const res = await updateItemQuantityAction(lineId, merchandiseId, quantity);
        if ('cart' in res) setCart(res.cart);
      });
    },
    [],
  );

  const removeItem = useCallback((lineId: string) => {
    startTransition(async () => {
      const res = await removeItemAction(lineId);
      if ('cart' in res) setCart(res.cart);
    });
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        isPending,
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

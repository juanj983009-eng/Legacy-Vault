import { createContext } from 'react';
import type { CartLine, CartTotals } from '../types/cart';

export type CartContextValue = {
  items: readonly CartLine[];
  totals: CartTotals;
  itemCount: number;
  canAdd: (productId: string) => boolean;
  addItem: (productId: string) => void;
  increaseItem: (productId: string) => void;
  decreaseItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  persistenceWarning: string | undefined;
};

export const CartContext = createContext<CartContextValue | null>(null);

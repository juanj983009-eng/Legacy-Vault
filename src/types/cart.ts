import type { Product } from './catalog';

export type CartItem = Readonly<{ productId: string; quantity: number }>;
export type CartLine = Readonly<CartItem & { product: Product; subtotalCents: number }>;
export type CartTotals = Readonly<{
  itemCount: number;
  subtotalCents: number;
  shippingCents: 0;
  totalCents: number;
}>;

export type CartAction =
  | { type: 'add' | 'increase' | 'decrease' | 'remove'; productId: string }
  | { type: 'clear' | 'dismiss' };

export type CartState = Readonly<{ items: readonly CartItem[]; message: string }>;

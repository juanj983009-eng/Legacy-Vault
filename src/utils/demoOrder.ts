import type { CartItem, CartLine } from '../types/cart';
import type { DemoOrder, DemoOrderLine } from '../types/checkout';
import { calculateCart, type CartCatalog } from './cart';

export function toOrderLines(lines: readonly CartLine[]): DemoOrderLine[] {
  return lines.map(({ productId, product, quantity, subtotalCents }) => ({
    productId,
    name: product.name,
    image: product.images[0],
    quantity,
    subtotalCents,
  }));
}

export function createDemoOrder(items: readonly CartItem[], catalog: CartCatalog): DemoOrder | undefined {
  if (!items.length) return undefined;
  const { lines, totals } = calculateCart(items, catalog);
  if (lines.length !== items.length) return undefined;

  const random = globalThis.crypto.getRandomValues(new Uint32Array(2));
  const code = Array.from(random, (value) => value.toString(16).padStart(8, '0')).join('').toUpperCase();
  return { id: 'DEMO-' + code, lines: toOrderLines(lines), totals };
}

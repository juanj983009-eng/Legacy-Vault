import type { CartItem, CartLine, CartTotals } from '../types/cart';
import type { Product } from '../types/catalog';
import { MAX_UNIT_PRICE, MAX_CART_QUANTITY } from './catalogContract';

export { MAX_CART_QUANTITY };
export type CartCatalog = ReadonlyMap<string, Product>;

export function getCartProduct(productId: string, catalog: CartCatalog) {
  const product = catalog.get(productId);
  return product?.availability === 'available'
    && Number.isSafeInteger(product.priceCents)
    && product.priceCents > 0
    && product.priceCents <= MAX_UNIT_PRICE
    ? product
    : undefined;
}

export function isCartQuantity(quantity: unknown): quantity is number {
  return typeof quantity === 'number' && Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= MAX_CART_QUANTITY;
}

export function calculateCart(items: readonly CartItem[], catalog: CartCatalog): { lines: CartLine[]; totals: CartTotals } {
  const lines: CartLine[] = [];
  const seen = new Set<string>();
  let itemCount = 0;
  let subtotalCents = 0;
  for (const { productId, quantity } of items) {
    if (!isCartQuantity(quantity) || seen.has(productId)) continue;
    const product = getCartProduct(productId, catalog);
    if (!product) continue;

    seen.add(productId);
    const lineSubtotal = product.priceCents * quantity;
    lines.push({ productId, product, quantity, subtotalCents: lineSubtotal });
    itemCount += quantity;
    subtotalCents += lineSubtotal;
  }
  return { lines, totals: { itemCount, subtotalCents, shippingCents: 0, totalCents: subtotalCents } };
}

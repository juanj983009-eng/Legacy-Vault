import type { CartItem } from '../types/cart';
import { isCartQuantity } from '../utils/cart';
import { isProductId } from '../utils/catalogContract';

export const CART_STORAGE_KEY = 'legacy-vault:cart:v1';
const VERSION = 1;
const MAX_BYTES = 10 * 1024;
const INVALID_CART = 'No se pudo recuperar la selección guardada. Puedes armar un carrito nuevo.';

type CartLoad = { items: CartItem[]; warning?: string };

export function loadCart(): CartLoad {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return { items: [], warning: 'No se pudo leer el carrito guardado en este navegador.' };
  }
  if (raw === null) return { items: [] };
  if (raw.length > MAX_BYTES || new TextEncoder().encode(raw).byteLength > MAX_BYTES) {
    return { items: [], warning: INVALID_CART };
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { items: [], warning: INVALID_CART };
  }
  if (!data || typeof data !== 'object' || !('version' in data) || data.version !== VERSION
    || !('items' in data) || !Array.isArray(data.items)) {
    return { items: [], warning: INVALID_CART };
  }

  const items: CartItem[] = [];
  const seen = new Set<string>();
  for (const entry of data.items as unknown[]) {
    if (!entry || typeof entry !== 'object' || !('productId' in entry) || !('quantity' in entry)) continue;
    const { productId, quantity } = entry;
    if (!isProductId(productId) || seen.has(productId) || !isCartQuantity(quantity)) continue;
    seen.add(productId);
    items.push({ productId, quantity });
  }
  return items.length === data.items.length ? { items } : { items, warning: 'Se descartaron entradas inválidas del carrito guardado.' };
}

export function saveCart(items: readonly CartItem[]): string | undefined {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      version: VERSION,
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    }));
  } catch {
    return 'No se pudo guardar el carrito. Tu selección seguirá disponible en esta pestaña. Al recargar podrías recuperar una selección anterior.';
  }
}

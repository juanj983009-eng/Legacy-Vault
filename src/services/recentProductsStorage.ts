import { isProductId } from '../utils/catalogContract';

export const RECENT_PRODUCTS_STORAGE_KEY = 'legacy-vault:recent-products:v1';
export const RECENT_UPDATED_EVENT = 'legacy-vault:recent-updated';
export const MAX_RECENT_PRODUCTS = 6;
const VERSION = 1;
const MAX_BYTES = 5 * 1024;

export interface RecentProductsLoad {
  items: string[];
  warning?: string;
}

function exceedsMaxBytes(text: string): boolean {
  return text.length > MAX_BYTES || new TextEncoder().encode(text).byteLength > MAX_BYTES;
}

export function loadRecentProductIds(): RecentProductsLoad {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY);
  } catch {
    return {
      items: [],
      warning: 'No se pudieron leer los productos vistos recientemente en este navegador.',
    };
  }

  if (raw === null) return { items: [] };

  if (exceedsMaxBytes(raw)) {
    return {
      items: [],
      warning: 'Los datos de productos vistos recientemente no son válidos.',
    };
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {
      items: [],
      warning: 'Los datos de productos vistos recientemente no son válidos.',
    };
  }

  if (
    !data ||
    typeof data !== 'object' ||
    !('version' in data) ||
    data.version !== VERSION ||
    !('items' in data) ||
    !Array.isArray(data.items)
  ) {
    return {
      items: [],
      warning: 'Los datos de productos vistos recientemente no son válidos.',
    };
  }

  const items: string[] = [];
  const seen = new Set<string>();

  for (const entry of data.items) {
    if (typeof entry !== 'string' || !isProductId(entry) || seen.has(entry)) continue;
    seen.add(entry);
    items.push(entry);
    if (items.length >= MAX_RECENT_PRODUCTS) break;
  }

  return { items };
}

export function recordRecentProduct(
  productId: string
): { success: boolean; items: string[]; warning?: string } {
  if (!isProductId(productId)) {
    return { success: false, items: loadRecentProductIds().items };
  }

  const current = loadRecentProductIds().items;
  const next = [productId, ...current.filter((id) => id !== productId)].slice(
    0,
    MAX_RECENT_PRODUCTS
  );

  try {
    const serialized = JSON.stringify({
      version: VERSION,
      items: next,
    });

    if (exceedsMaxBytes(serialized)) {
      return {
        success: false,
        items: current,
        warning: 'El historial de productos recientes supera el límite de almacenamiento.',
      };
    }

    window.localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, serialized);

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event(RECENT_UPDATED_EVENT));
    }

    return { success: true, items: next };
  } catch {
    return {
      success: false,
      items: next,
      warning: 'No se pudieron guardar los productos vistos recientemente en este navegador.',
    };
  }
}

export function clearRecentProducts(): void {
  try {
    window.localStorage.removeItem(RECENT_PRODUCTS_STORAGE_KEY);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event(RECENT_UPDATED_EVENT));
    }
  } catch {
    // Ignore clear failure
  }
}

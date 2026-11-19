import { isProductId } from '../utils/catalogContract';

export const FAVORITES_STORAGE_KEY = 'legacy-vault:favorites:v1';
const VERSION = 1;
const MAX_BYTES = 10 * 1024;
const INVALID_FAVORITES = 'No se pudo recuperar la lista de favoritos guardada. Puedes empezar una lista nueva.';

export type FavoritesLoad = { items: string[]; warning?: string };

export function loadFavorites(): FavoritesLoad {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
  } catch {
    return { items: [], warning: 'No se pudieron leer los favoritos guardados en este navegador.' };
  }
  if (raw === null) return { items: [] };
  if (raw.length > MAX_BYTES || new TextEncoder().encode(raw).byteLength > MAX_BYTES) {
    return { items: [], warning: INVALID_FAVORITES };
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { items: [], warning: INVALID_FAVORITES };
  }
  if (
    !data ||
    typeof data !== 'object' ||
    !('version' in data) ||
    data.version !== VERSION ||
    !('items' in data) ||
    !Array.isArray(data.items)
  ) {
    return { items: [], warning: INVALID_FAVORITES };
  }

  const items: string[] = [];
  const seen = new Set<string>();
  for (const entry of data.items as unknown[]) {
    if (typeof entry !== 'string' || !isProductId(entry) || seen.has(entry)) continue;
    seen.add(entry);
    items.push(entry);
  }
  return items.length === data.items.length
    ? { items }
    : { items, warning: 'Se descartaron entradas inválidas de favoritos guardados.' };
}

export function saveFavorites(items: readonly string[]): string | undefined {
  try {
    const validItems = items.filter(isProductId);
    const unique = Array.from(new Set(validItems));
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({
        version: VERSION,
        items: unique,
      })
    );
  } catch {
    return 'No se pudieron guardar los favoritos en este navegador. Tu selección seguirá disponible en esta pestaña.';
  }
}

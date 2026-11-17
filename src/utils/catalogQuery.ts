import { categories } from '../data/catalog';
import type { CategoryId, Product } from '../types/catalog';

type CatalogOrder = 'nombre-asc' | 'precio-asc' | 'precio-desc';

export type CatalogQuery = {
  q: string;
  categoryId?: CategoryId;
  minCents?: number;
  maxCents?: number;
  order: CatalogOrder;
  error?: string;
};

function parsePrice(raw: string): number | undefined {
  const match = /^(\d{1,14})(?:[.,](\d{1,2}))?$/.exec(raw);
  if (!match) return undefined;

  const cents = Number(match[1] + (match[2] ?? '').padEnd(2, '0'));
  return Number.isSafeInteger(cents) ? cents : undefined;
}

export function parseCatalogQuery(params: URLSearchParams): CatalogQuery {
  const q = (params.get('buscar') ?? params.get('q') ?? '').trim().slice(0, 100);
  const categoryId = categories.find(({ id }) => id === params.get('categoria'))?.id;
  const rawOrder = params.get('orden');
  const order = rawOrder === 'precio-asc' || rawOrder === 'precio-desc' ? rawOrder : 'nombre-asc';
  const query: CatalogQuery = { q, order };
  if (categoryId !== undefined) query.categoryId = categoryId;

  const rawMin = (params.get('min') ?? '').trim();
  const rawMax = (params.get('max') ?? '').trim();
  const minCents = parsePrice(rawMin);
  const maxCents = parsePrice(rawMax);

  if (minCents !== undefined && maxCents !== undefined && minCents > maxCents) {
    query.error = 'El precio mínimo debe ser menor o igual al máximo.';
    return query;
  }
  if (minCents !== undefined) query.minCents = minCents;
  if (maxCents !== undefined) query.maxCents = maxCents;
  if ((rawMin && minCents === undefined) || (rawMax && maxCents === undefined)) {
    query.error = 'Introduce precios válidos desde cero y con hasta dos decimales.';
  }
  return query;
}

function priceParam(cents: number): string {
  const soles = Math.floor(cents / 100);
  const fraction = cents % 100;
  return fraction === 0 ? String(soles) : [soles, String(fraction).padStart(2, '0')].join('.');
}

export function serializeCatalogQuery(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set('buscar', query.q);
  if (query.categoryId) params.set('categoria', query.categoryId);
  if (query.minCents !== undefined) params.set('min', priceParam(query.minCents));
  if (query.maxCents !== undefined) params.set('max', priceParam(query.maxCents));
  if (query.order !== 'nombre-asc') params.set('orden', query.order);
  return params;
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Mark}/gu, '').toLocaleLowerCase('es-PE');
}

const NAME_ORDER = new Intl.Collator('es-PE', { sensitivity: 'base' });

export function selectProducts(products: readonly Product[], query: CatalogQuery): readonly Product[] {
  const term = normalize(query.q);
  return products.filter((product) => (
    (query.categoryId === undefined || product.categoryId === query.categoryId)
    && (query.minCents === undefined || product.priceCents >= query.minCents)
    && (query.maxCents === undefined || product.priceCents <= query.maxCents)
    && (!term || normalize(product.name).includes(term) || normalize(product.description).includes(term))
  )).sort((a, b) => {
    let comparison: number;
    switch (query.order) {
      case 'precio-asc':
        comparison = a.priceCents - b.priceCents;
        break;
      case 'precio-desc':
        comparison = b.priceCents - a.priceCents;
        break;
      default:
        comparison = NAME_ORDER.compare(a.name, b.name);
    }
    return comparison || a.id.localeCompare(b.id, 'en');
  });
}

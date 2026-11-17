import { categories } from '../data/catalog';
import type { Product, ProductFeature, ProductImage } from '../types/catalog';

export const MAX_PRODUCTS = 1000;
export const MAX_CART_QUANTITY = 5;
export const MAX_UNIT_PRICE = Math.floor(Number.MAX_SAFE_INTEGER / (MAX_PRODUCTS * MAX_CART_QUANTITY));

export function isProductId(id: unknown): id is string {
  return typeof id === 'string' && id.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function isImage(value: unknown): value is ProductImage {
  return isRecord(value) && typeof value.src === 'string'
    && /^\/images\/[a-z0-9-]+\.(?:webp|svg|png|jpe?g|avif)$/.test(value.src)
    && isText(value.alt, 300);
}

function isFeature(value: unknown): value is ProductFeature {
  return isRecord(value) && isText(value.label, 100) && isText(value.value, 300)
    && ((value.basis === 'demonstrative' && !('evidence' in value))
      || (value.basis === 'verified' && isText(value.evidence, 500)));
}

export function isProduct(value: unknown): value is Product {
  return isRecord(value) && isProductId(value.id) && isText(value.name, 160)
    && categories.some(({ id }) => id === value.categoryId) && value.currency === 'PEN'
    && typeof value.priceCents === 'number' && Number.isSafeInteger(value.priceCents)
    && value.priceCents > 0 && value.priceCents <= MAX_UNIT_PRICE
    && Array.isArray(value.images) && value.images.length > 0 && value.images.length <= 12 && value.images.every(isImage)
    && isText(value.description, 3000)
    && Array.isArray(value.features) && value.features.length <= 30 && value.features.every(isFeature)
    && (value.availability === 'available' || value.availability === 'unavailable');
}

export function isProductList(value: unknown): value is Product[] {
  return Array.isArray(value) && value.length <= MAX_PRODUCTS && value.every(isProduct)
    && new Set(value.map(({ id }) => id)).size === value.length;
}

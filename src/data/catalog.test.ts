import { describe, expect, it } from 'vitest';
import { categories, featuredProductIds } from './catalog';
import { products, byId } from '../test/catalogFixture';
const getProductById = (id: string) => byId.get(id);

describe('catálogo demostrativo único', () => {
  it('contiene veinte piezas y las cuatro categorías acordadas sin IDs repetidos', () => {
    expect(products.length).toBe(20);
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
    expect(categories.map((category) => category.id)).toEqual([
      'relojes', 'monedas', 'camaras', 'antiguedades',
    ]);
    expect(categories.find((category) => category.id === 'antiguedades')?.name)
      .toBe('Antigüedades y coleccionables');
  });

  it('resuelve por ID la misma instancia canónica y no inventa IDs', () => {
    expect(getProductById('reloj-bolsillo-suizo')).toBe(products[0]);
    expect(getProductById('reloj-bolsillo-suizo')?.priceCents).toBe(245000);
    expect(getProductById('no-existe')).toBeUndefined();
    expect(getProductById('toString')).toBeUndefined();
    expect(getProductById('__proto__')).toBeUndefined();
  });

  it('usa precios positivos enteros en PEN y referencias válidas', () => {
    expect(products.slice(0, 10).map((product) => product.priceCents))
      .toEqual([245000, 189000, 312000, 278000, 345000, 215000, 285000, 198000, 295000, 329000]);
    for (const product of products) {
      expect(Number.isSafeInteger(product.priceCents)).toBe(true);
      expect(product.priceCents).toBeGreaterThan(0);
      expect(product.currency).toBe('PEN');
      expect(categories.some((category) => category.id === product.categoryId)).toBe(true);
      expect(['available', 'unavailable']).toContain(product.availability);
      expect(product.name.trim().length).toBeGreaterThan(0);
      expect(product.description.trim().length).toBeGreaterThan(0);
    }
    expect(featuredProductIds.length).toBeGreaterThan(0);
    expect(new Set(featuredProductIds).size).toBe(featuredProductIds.length);
    expect(featuredProductIds.every((id) => getProductById(id))).toBe(true);
  });

  it('conserva una fotografía local propia por pieza y características demostrativas', () => {
    expect(products.length).toBeGreaterThan(0);
    for (const product of products) {
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.features.length).toBeGreaterThan(0);
      for (const image of product.images) {
        expect(image.src).toMatch(/^\/images\/producto-[a-z-]+\.webp$/);
        expect(image.alt.trim().length).toBeGreaterThan(0);
      }
      for (const feature of product.features) {
        expect(feature.basis).toBe('demonstrative');
      }
    }
    expect(new Set(products.map(({ images }) => images[0].src)).size).toBe(products.length);
  });
});

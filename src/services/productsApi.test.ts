import { describe, expect, it, vi } from 'vitest';
import { products } from '../test/catalogFixture';
import { getProductById, getProducts } from './productsApi';

const signal = () => new AbortController().signal;

describe('contrato HTTP de productos', () => {
  it('obtiene la lista y el detalle con el ID solicitado', async () => {
    expect(await getProducts(signal())).toHaveLength(20);
    expect(await getProductById('reloj-bolsillo-suizo', signal())).toEqual(products[0]);
  });

  it('evita solicitudes con IDs fuera del contrato', async () => {
    expect(await getProductById('../relojes', signal())).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([
    { entries: [{ ...products[0], priceCents: 1.5 }] },
    { entries: [{ ...products[0], currency: 'USD' }] },
    { entries: [{ ...products[0], images: [{ src: '//otro.example/x.webp', alt: 'Foto' }] }] },
    { entries: [products[0], products[0]] },
  ])('rechaza registros inválidos o duplicados (%#)', async ({ entries }) => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(entries));
    await expect(getProducts(signal())).rejects.toThrow(/catálogo inválido/i);
  });

  it('rechaza HTML, JSON inválido y un detalle con otro ID', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('<html>'));
    await expect(getProducts(signal())).rejects.toThrow();
    vi.mocked(fetch).mockResolvedValueOnce(new Response('{', { headers: { 'Content-Type': 'application/json' } }));
    await expect(getProducts(signal())).rejects.toThrow();
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(products[1]));
    await expect(getProductById('reloj-bolsillo-suizo', signal())).rejects.toThrow();
  });
});

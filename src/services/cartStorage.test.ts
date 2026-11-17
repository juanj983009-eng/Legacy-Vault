import { afterEach, describe, expect, it, vi } from 'vitest';
import { CART_STORAGE_KEY, loadCart, saveCart } from './cartStorage';

const WATCH = { productId: 'reloj-bolsillo-suizo', quantity: 2 };

afterEach(() => localStorage.clear());

describe('persistencia del carrito', () => {
  it('solo guarda versión, identificadores y cantidades y recupera las unidades', () => {
    const enriched = { ...WATCH, priceCents: 1, name: 'precio manipulado' };
    expect(saveCart([enriched])).toBeUndefined();
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({ version: 1, items: [WATCH] });
    expect(loadCart().items).toEqual([WATCH]);
  });

  it('descarta filas mal formadas y duplicadas, y conserva IDs pendientes de validar', () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      version: 1,
      items: [null, { ...WATCH, quantity: 0 }, { ...WATCH, quantity: -1 }, { ...WATCH, quantity: 1.5 },
        { ...WATCH, quantity: 6 }, { ...WATCH, quantity: '2' }, { productId: 'no-existe', quantity: 1 },
        { productId: 'reloj-caza-laton', quantity: 1 }, { ...WATCH, priceCents: 1 }, { ...WATCH, quantity: 5 }],
    }));
    expect(loadCart()).toMatchObject({ items: [{ productId: 'no-existe', quantity: 1 }, { productId: 'reloj-caza-laton', quantity: 1 }, WATCH], warning: expect.any(String) });
  });

  it.each(['{', '{"version":2,"items":[]}', '{"version":1,"items":{}}', 'x'.repeat(10241)])(
    'recupera un carrito vacío con aviso cuando la estructura es inválida',
    (raw) => {
      localStorage.setItem(CART_STORAGE_KEY, raw);
      expect(loadCart()).toMatchObject({ items: [], warning: expect.any(String) });
    },
  );

  it('devuelve avisos si el navegador deniega lectura o escritura', () => {
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denegado'); });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('cuota'); });
    expect(loadCart()).toMatchObject({ items: [], warning: expect.any(String) });
    expect(saveCart([WATCH])).toMatch(/guardar/i);
    read.mockRestore();
    write.mockRestore();
  });
});

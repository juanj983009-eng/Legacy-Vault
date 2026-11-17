import { describe, expect, it } from 'vitest';
import { calculateCart } from '../utils/cart';
import { formatMoney } from '../utils/money';
import { cartReducer as reduce } from './cartReducer';
import { byId } from '../test/catalogFixture';
const cartReducer = (state: Parameters<typeof reduce>[0], action: Parameters<typeof reduce>[1]) => reduce(state, action, byId);

const watch = 'reloj-bolsillo-suizo';
const coin = 'moneda-carlos-iii';
const empty = { items: [], message: '' };
const add = { type: 'add', productId: watch } as const;

describe('reglas del carrito', () => {
  it('agrega y acumula unidades del mismo producto en una línea', () => {
    const once = cartReducer(empty, add);
    expect(once.items).toEqual([{ productId: watch, quantity: 1 }]);
    expect(cartReducer(once, add).items).toEqual([{ productId: watch, quantity: 2 }]);
  });

  it('disminuye hasta uno y elimina mediante la acción explícita', () => {
    const twice = cartReducer(cartReducer(empty, add), add);
    const down = { type: 'decrease', productId: watch } as const;
    const once = cartReducer(twice, down);
    expect(once.items[0]?.quantity).toBe(1);
    expect(cartReducer(once, down).items).toBe(once.items);
    expect(cartReducer(once, { type: 'remove', productId: watch }).items).toEqual([]);
  });

  it('aplica el límite de cinco también a adiciones repetidas', () => {
    let state = cartReducer(empty, add);
    for (let i = 1; i < 7; i++) state = cartReducer(state, { type: 'increase', productId: watch });
    expect(state.items[0]?.quantity).toBe(5);
    expect(cartReducer(state, add).items).toBe(state.items);
    expect(cartReducer(state, add).message).toMatch(/máximo/i);
  });

  it.each(['no-existe', 'reloj-caza-laton'])('rechaza agregar el ID %s', (productId) => {
    const result = cartReducer(empty, { type: 'add', productId });
    expect(result.items).toBe(empty.items);
    expect(result.message).toMatch(/no está disponible/i);
  });

  it('vacía todas las líneas', () => {
    const state = cartReducer(cartReducer(empty, add), { type: 'add', productId: coin });
    expect(cartReducer(state, { type: 'clear' }).items).toEqual([]);
  });

  it('calcula subtotales, unidades y total desde precios canónicos y formatea PEN', () => {
    const { lines, totals } = calculateCart([{ productId: watch, quantity: 2 }, { productId: coin, quantity: 1 }], byId);
    expect(lines.map((line) => line.subtotalCents)).toEqual([490000, 189000]);
    expect(totals).toEqual({ itemCount: 3, subtotalCents: 679000, shippingCents: 0, totalCents: 679000 });
    expect(formatMoney(totals.totalCents).replace(/\s+/g, ' ')).toBe('S/ 6,790.00');
  });

  it('evita calcular con cantidades o IDs inválidos', () => {
    const { lines, totals } = calculateCart([0, -1, NaN, Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1].map(
      (quantity) => ({ productId: watch, quantity }),
    ).concat({ productId: 'no-existe', quantity: 1 }), byId);
    expect(lines).toEqual([]);
    expect(totals.totalCents).toBe(0);
  });
});

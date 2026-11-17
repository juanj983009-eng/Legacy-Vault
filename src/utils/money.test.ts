import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';

describe('formatMoney: céntimos a soles peruanos', () => {
  it.each([[0, '0.00'], [1, '0.01'], [99, '0.99'], [245000, '2,450.00'], [434000, '4,340.00']])(
    'formatea %i céntimos sin perder decimales', (cents, amount) => {
      expect(formatMoney(cents).replace(/\s/g, ' ')).toBe(`S/ ${amount}`);
    },
  );

  it.each([-1, 1.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rechaza un importe inválido: %s', (cents) => {
      expect(() => formatMoney(cents)).toThrow(RangeError);
    },
  );
});

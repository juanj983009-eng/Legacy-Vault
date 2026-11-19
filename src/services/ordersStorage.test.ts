import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { StoredDemoOrder } from '../types/orders';
import {
  EXISTING_STORAGE_INVALID,
  EXISTING_STORAGE_UNREADABLE,
  INVALID_STORAGE,
  MAX_BYTES,
  ORDERS_STORAGE_KEY,
  SAVE_ERROR,
  STORAGE_LIMIT_EXCEEDED,
  clearOrders,
  getOrdersCount,
  loadOrders,
  saveOrder,
} from './ordersStorage';

function makeValidOrder(id = 'DEMO-1234567890ABCDEF', createdAt = '2026-11-17T20:00:00.000Z'): StoredDemoOrder {
  return {
    id,
    createdAt,
    lines: [
      {
        productId: 'reloj-bolsillo-suizo',
        name: 'Reloj de Bolsillo Suizo (c. 1912)',
        quantity: 1,
        subtotalCents: 125000,
        image: {
          src: '/images/reloj-bolsillo.webp',
          alt: 'Reloj de Bolsillo Suizo',
        },
      },
    ],
    totals: {
      itemCount: 1,
      subtotalCents: 125000,
      shippingCents: 0,
      totalCents: 125000,
    },
  };
}

function makeHeavyOrder(id: string): StoredDemoOrder {
  const lines = Array.from({ length: 50 }, (_, i) => ({
    productId: 'reloj-bolsillo-suizo' as const,
    name: `Pieza Histórica de Archivo Pedagógico No. ${i} - ${'X'.repeat(120)}`,
    quantity: 1,
    subtotalCents: 100000,
    image: {
      src: '/images/reloj-bolsillo.webp',
      alt: 'Reloj de prueba',
    },
  }));
  return {
    id,
    createdAt: '2026-11-17T20:00:00.000Z',
    lines,
    totals: {
      itemCount: 50,
      subtotalCents: 5000000,
      shippingCents: 0,
      totalCents: 5000000,
    },
  };
}

describe('ordersStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('retorna lista vacía sin advertencia cuando no hay nada almacenado', () => {
    const result = loadOrders();
    expect(result.orders).toEqual([]);
    expect(result.warning).toBeUndefined();
    expect(getOrdersCount()).toBe(0);
  });

  it('guarda y recupera un pedido válido preservando nombres de piezas y totales', () => {
    const order = makeValidOrder();
    const saveResult = saveOrder(order);
    expect(saveResult.success).toBe(true);
    expect(saveResult.warning).toBeUndefined();

    const { orders, warning } = loadOrders();
    expect(warning).toBeUndefined();
    expect(orders).toHaveLength(1);
    expect(orders[0]?.id).toBe('DEMO-1234567890ABCDEF');
    expect(orders[0]?.lines[0]?.name).toBe('Reloj de Bolsillo Suizo (c. 1912)');
    expect(orders[0]?.totals.totalCents).toBe(125000);
    expect(getOrdersCount()).toBe(1);
  });

  it('ordena múltiples pedidos del más reciente al más antiguo', () => {
    const older = makeValidOrder('DEMO-1111111111111111', '2026-11-15T10:00:00.000Z');
    const middle = makeValidOrder('DEMO-2222222222222222', '2026-11-16T12:00:00.000Z');
    const newest = makeValidOrder('DEMO-3333333333333333', '2026-11-17T15:00:00.000Z');

    saveOrder(older);
    saveOrder(newest);
    saveOrder(middle);

    const { orders } = loadOrders();
    expect(orders.map((o) => o.id)).toEqual([
      'DEMO-3333333333333333',
      'DEMO-2222222222222222',
      'DEMO-1111111111111111',
    ]);
  });

  it('evita duplicar pedidos con el mismo identificador', () => {
    const order = makeValidOrder('DEMO-ABCDEF1234567890');
    saveOrder(order);
    saveOrder(order);

    const { orders } = loadOrders();
    expect(orders).toHaveLength(1);
  });

  it('no guarda ni acepta pedidos con datos personales (email, nombre, teléfono, dirección)', () => {
    const piiOrder = {
      ...makeValidOrder(),
      email: 'comprador@ejemplo.com',
      name: 'Comprador Secreto',
      address: 'Calle 123',
      phone: '+51999999999',
    } as unknown as StoredDemoOrder;

    const result = saveOrder(piiOrder);
    expect(result.success).toBe(false);
    expect(result.warning).toBeDefined();

    const { orders } = loadOrders();
    expect(orders).toHaveLength(0);

    // Verificar en localStorage que no hay ningún dato PII escrito
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    expect(raw).toBeNull();
  });

  it('descarta entradas corruptas individuales y emite advertencia conservando las válidas', () => {
    const valid = makeValidOrder('DEMO-VALID00000000001');
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        orders: [
          valid,
          { id: 'INVALID-ID', createdAt: 'fecha-falsa', lines: [] }, // corrupto
        ],
      })
    );

    const { orders, warning } = loadOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0]?.id).toBe('DEMO-VALID00000000001');
    expect(warning).toMatch(/entradas no válidas/i);
  });

  it('informa problema de datos no válidos y no afirma recuperar pedidos ante JSON totalmente corrupto', () => {
    localStorage.setItem(ORDERS_STORAGE_KEY, '{ json corrupto total !!!');

    const { orders, warning } = loadOrders();
    expect(orders).toHaveLength(0);
    expect(warning).toMatch(/datos no válidos/i);
  });

  it('informa problema de datos no válidos cuando la versión o estructura no coincide', () => {
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({ version: 99, orders: 'no-es-un-array' })
    );

    const { orders, warning } = loadOrders();
    expect(orders).toHaveLength(0);
    expect(warning).toMatch(/datos no válidos/i);
  });

  it('gestiona fallos al guardar por cuota o almacenamiento inaccesible sin lanzar excepciones', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const result = saveOrder(makeValidOrder());
    expect(result.success).toBe(false);
    expect(result.warning).toMatch(/no se pudo guardar/i);
  });

  it('permite vaciar los pedidos con clearOrders', () => {
    saveOrder(makeValidOrder('DEMO-AAAA111122223333'));
    expect(getOrdersCount()).toBe(1);

    const clearResult = clearOrders();
    expect(clearResult.success).toBe(true);

    const { orders } = loadOrders();
    expect(orders).toHaveLength(0);
    expect(getOrdersCount()).toBe(0);
  });

  describe('control de persistencia, integridad y límites de tamaño', () => {
    it('rechaza guardar un pedido cuando el historial serializado supera el límite de bytes, conservando los datos previos sin reportar falso éxito', () => {
      // Guardar 3 pedidos pesados que caben dentro del límite de 50 KB
      const heavy1 = makeHeavyOrder('DEMO-HEAVY0000000001');
      const heavy2 = makeHeavyOrder('DEMO-HEAVY0000000002');
      const heavy3 = makeHeavyOrder('DEMO-HEAVY0000000003');

      expect(saveOrder(heavy1).success).toBe(true);
      expect(saveOrder(heavy2).success).toBe(true);
      expect(saveOrder(heavy3).success).toBe(true);

      const beforeSaveOrders = loadOrders().orders;
      expect(beforeSaveOrders).toHaveLength(3);
      const rawBefore = localStorage.getItem(ORDERS_STORAGE_KEY);
      expect(rawBefore).not.toBeNull();

      // El 4to pedido pesado causará que el total supere MAX_BYTES (50 KB)
      const heavy4 = makeHeavyOrder('DEMO-HEAVY0000000004');
      const result = saveOrder(heavy4);

      expect(result.success).toBe(false);
      expect(result.warning).toBe(STORAGE_LIMIT_EXCEEDED);
      expect(result.warning).toMatch(/límite de tamaño/i);

      // Conservación de datos previos intactos
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(rawBefore);
      const afterAttemptOrders = loadOrders().orders;
      expect(afterAttemptOrders).toHaveLength(3);
      expect(afterAttemptOrders.map((o) => o.id)).toEqual([
        'DEMO-HEAVY0000000003',
        'DEMO-HEAVY0000000002',
        'DEMO-HEAVY0000000001',
      ]);
    });

    it('rechaza la lectura e informa datos no válidos cuando el contenido almacenado supera el límite de bytes', () => {
      const oversizedRaw = ' '.repeat(MAX_BYTES + 1);
      localStorage.setItem(ORDERS_STORAGE_KEY, oversizedRaw);

      const loadResult = loadOrders();
      expect(loadResult.orders).toHaveLength(0);
      expect(loadResult.warning).toBe(INVALID_STORAGE);

      // Si se intenta guardar un pedido nuevo sobre este almacenamiento excedido, no lo sobrescribe
      const newOrder = makeValidOrder('DEMO-AFTEROVERSIZED1');
      const saveResult = saveOrder(newOrder);

      expect(saveResult.success).toBe(false);
      expect(saveResult.warning).toBe(EXISTING_STORAGE_INVALID);
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(oversizedRaw);
    });

    it('no sobrescribe el almacenamiento si el JSON existente es corrupto, conserva los datos previos y no informa falso éxito', () => {
      const corruptJson = '{"version":1,"orders":[{incompleto-sin-cerrar...';
      localStorage.setItem(ORDERS_STORAGE_KEY, corruptJson);

      const newOrder = makeValidOrder('DEMO-NEWORDER0000001');
      const result = saveOrder(newOrder);

      expect(result.success).toBe(false);
      expect(result.warning).toBe(EXISTING_STORAGE_INVALID);
      expect(result.warning).toMatch(/no se pudo añadir el pedido al historial/i);

      // El contenido corrupto previo se conserva íntegro sin sobrescribir
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(corruptJson);

      // loadOrders sigue reportando datos no válidos y 0 pedidos (ausencia de falso éxito)
      const loadResult = loadOrders();
      expect(loadResult.orders).toHaveLength(0);
      expect(loadResult.warning).toBe(INVALID_STORAGE);
    });

    it('ante un fallo de lectura no intenta sobrescribir el almacenamiento, conserva los datos previos y rechaza el guardado', () => {
      const initial = makeValidOrder('DEMO-PREVREADFAIL001');
      expect(saveOrder(initial).success).toBe(true);
      const rawBefore = localStorage.getItem(ORDERS_STORAGE_KEY);

      // Simular fallo de lectura al invocar getItem
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError: LocalStorage access denied');
      });

      const nextOrder = makeValidOrder('DEMO-NEXTREADFAIL002');
      const result = saveOrder(nextOrder);

      expect(result.success).toBe(false);
      expect(result.warning).toBe(EXISTING_STORAGE_UNREADABLE);
      expect(result.warning).toMatch(/no se pudieron leer/i);

      // Restaurar espía y comprobar conservación de datos previos
      vi.restoreAllMocks();
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(rawBefore);
      expect(loadOrders().orders.map((o) => o.id)).toEqual(['DEMO-PREVREADFAIL001']);
    });

    it('ante un fallo de escritura no afirma éxito y conserva el estado previo sin lanzar excepciones', () => {
      const initial = makeValidOrder('DEMO-PREVWRITEFAIL01');
      expect(saveOrder(initial).success).toBe(true);
      const rawBefore = localStorage.getItem(ORDERS_STORAGE_KEY);

      // Simular fallo de escritura en setItem
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const nextOrder = makeValidOrder('DEMO-NEXTWRITEFAIL02');
      const result = saveOrder(nextOrder);

      expect(result.success).toBe(false);
      expect(result.warning).toBe(SAVE_ERROR);
      expect(result.warning).toMatch(/no se pudo guardar el pedido/i);

      // Restaurar espía y comprobar conservación de datos previos
      vi.restoreAllMocks();
      expect(localStorage.getItem(ORDERS_STORAGE_KEY)).toBe(rawBefore);
      expect(loadOrders().orders.map((o) => o.id)).toEqual(['DEMO-PREVWRITEFAIL01']);
    });
  });
});

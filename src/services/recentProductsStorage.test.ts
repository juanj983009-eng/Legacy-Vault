import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MAX_RECENT_PRODUCTS,
  RECENT_PRODUCTS_STORAGE_KEY,
  clearRecentProducts,
  loadRecentProductIds,
  recordRecentProduct,
} from './recentProductsStorage';

const P1 = 'reloj-bolsillo-suizo';
const P2 = 'camara-kodak-brownie';
const P3 = 'moneda-carlos-iii';
const P4 = 'brujula-militar-alemana';
const P5 = 'binoculares-marina-francesa';
const P6 = 'caja-musica-suiza';
const P7 = 'astrolabio-nautico';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('persistencia de productos vistos recientemente', () => {
  it('retorna lista vacía cuando no hay nada almacenado', () => {
    expect(loadRecentProductIds().items).toEqual([]);
    expect(loadRecentProductIds().warning).toBeUndefined();
  });

  it('registra un producto válido y lo persiste en localStorage', () => {
    const result = recordRecentProduct(P1);
    expect(result.success).toBe(true);
    expect(result.items).toEqual([P1]);

    const raw = localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual({
      version: 1,
      items: [P1],
    });

    expect(loadRecentProductIds().items).toEqual([P1]);
  });

  it('mantiene el orden cronológico con el producto más reciente al principio', () => {
    recordRecentProduct(P1);
    recordRecentProduct(P2);
    recordRecentProduct(P3);

    expect(loadRecentProductIds().items).toEqual([P3, P2, P1]);
  });

  it('mueve una pieza consultada nuevamente al primer lugar sin duplicarla', () => {
    recordRecentProduct(P1);
    recordRecentProduct(P2);
    recordRecentProduct(P3);
    expect(loadRecentProductIds().items).toEqual([P3, P2, P1]);

    // Volver a consultar P1
    const result = recordRecentProduct(P1);
    expect(result.success).toBe(true);
    expect(loadRecentProductIds().items).toEqual([P1, P3, P2]);
  });

  it('conserva como máximo 6 piezas descartando las más antiguas', () => {
    recordRecentProduct(P1);
    recordRecentProduct(P2);
    recordRecentProduct(P3);
    recordRecentProduct(P4);
    recordRecentProduct(P5);
    recordRecentProduct(P6);

    expect(loadRecentProductIds().items).toHaveLength(MAX_RECENT_PRODUCTS);
    expect(loadRecentProductIds().items).toEqual([P6, P5, P4, P3, P2, P1]);

    // Registrar una 7ma pieza (P7)
    recordRecentProduct(P7);
    const stored = loadRecentProductIds().items;

    expect(stored).toHaveLength(MAX_RECENT_PRODUCTS);
    expect(stored).toEqual([P7, P6, P5, P4, P3, P2]);
    expect(stored).not.toContain(P1);
  });

  it('ignora identificadores con formato inválido o vacíos sin alterar el historial', () => {
    recordRecentProduct(P1);

    expect(recordRecentProduct('ID_INVALIDO!').success).toBe(false);
    expect(recordRecentProduct('').success).toBe(false);
    expect(recordRecentProduct('   ').success).toBe(false);
    expect(recordRecentProduct('reloj_con_guiones_bajos').success).toBe(false);

    expect(loadRecentProductIds().items).toEqual([P1]);
  });

  it('maneja JSON corrupto devolviendo lista vacía y aviso sin lanzar excepciones ni borrar datos', () => {
    const corrupt = '{ este no es un json válido';
    localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, corrupt);

    const loaded = loadRecentProductIds();
    expect(loaded.items).toEqual([]);
    expect(loaded.warning).toMatch(/no son válidos/i);
    expect(localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY)).toBe(corrupt);
  });

  it('descarta entradas corruptas en la lista preservando las válidas', () => {
    localStorage.setItem(
      RECENT_PRODUCTS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [P1, 'INVALIDO!', null, 123, P2, P1], // duplicado y corruptos
      })
    );

    const loaded = loadRecentProductIds();
    expect(loaded.items).toEqual([P1, P2]);
  });

  it('maneja contenido que supera el límite de bytes', () => {
    localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, ' '.repeat(5 * 1024 + 1));
    const loaded = loadRecentProductIds();
    expect(loaded.items).toEqual([]);
    expect(loaded.warning).toBeDefined();
  });

  it('gestiona fallos al leer (getItem) y al escribir (setItem) sin lanzar excepciones', () => {
    recordRecentProduct(P1);

    // Fallo de lectura
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const readResult = loadRecentProductIds();
    expect(readResult.items).toEqual([]);
    expect(readResult.warning).toMatch(/no se pudieron leer/i);

    // Fallo de escritura
    vi.restoreAllMocks();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const writeResult = recordRecentProduct(P2);
    expect(writeResult.success).toBe(false);
    expect(writeResult.warning).toMatch(/no se pudieron guardar/i);
  });

  it('permite limpiar el historial con clearRecentProducts', () => {
    recordRecentProduct(P1);
    expect(loadRecentProductIds().items).toHaveLength(1);

    clearRecentProducts();
    expect(loadRecentProductIds().items).toHaveLength(0);
    expect(localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY)).toBeNull();
  });

  it('no guarda datos personales ni propiedades ajenas a los identificadores', () => {
    recordRecentProduct(P1);
    const raw = localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY) || '';
    const parsed = JSON.parse(raw);

    expect(Object.keys(parsed)).toEqual(['version', 'items']);
    expect(parsed.items.every((item: unknown) => typeof item === 'string')).toBe(true);
    expect(raw).not.toContain('email');
    expect(raw).not.toContain('nombre');
    expect(raw).not.toContain('usuario');
  });
});

import { describe, expect, it } from 'vitest';
import { products } from '../test/catalogFixture';
import { parseCatalogQuery, selectProducts, serializeCatalogQuery } from './catalogQuery';

const parse = (search: string) => parseCatalogQuery(new URLSearchParams(search));
const ids = (search: string) => selectProducts(products, parse(search)).map(({ id }) => id);

describe('consulta del catálogo', () => {
  it('busca por nombre y descripción sin distinguir mayúsculas ni tildes', () => {
    expect(ids('buscar=BRUJULA')).toEqual(['brujula-cardanica']);
    expect(ids('buscar=visor+optico')).toEqual(['telemetro-mecanico']);
  });

  it('acepta q como alias y da prioridad a buscar cuando ambos están presentes', () => {
    expect(ids('q=brujula')).toEqual(['brujula-cardanica']);
    expect(ids('buscar=plata&q=brujula')).toEqual(['moneda-carlos-iii']);
  });

  it('combina búsqueda, categoría y límites inclusivos', () => {
    expect(ids('buscar=reloj&categoria=relojes&min=2150&max=2150')).toEqual(['reloj-caza-laton']);
    expect(ids('buscar=reloj&categoria=monedas')).toEqual([]);
  });

  it('ordena por precio en ambas direcciones y resuelve empates por ID', () => {
    expect(ids('orden=precio-asc').at(0)).toBe('ficha-comercial-laton');
    expect(ids('orden=precio-desc').at(0)).toBe('astrolabio-nautico');
    expect(selectProducts([
      { ...products[0]!, id: 'z' },
      { ...products[0]!, id: 'a' },
    ], parse('orden=precio-desc')).map(({ id }) => id)).toEqual(['a', 'z']);
  });

  it('ignora categorías, órdenes y parámetros desconocidos', () => {
    expect(parse('categoria=ajena&orden=azar&extra=1')).toEqual({ q: '', order: 'nombre-asc' });
  });

  it.each(['-1', '1e3', '2.001', 'Infinity', '90071992547409.92'])('descarta un importe inválido: %s', (value) => {
    const query = parse(`min=${value}&max=3000`);
    expect(query.minCents).toBeUndefined();
    expect(query.maxCents).toBe(300000);
    expect(query.error).toBeTruthy();
  });

  it('descarta ambos límites cuando el rango está invertido', () => {
    const query = parse('min=3000&max=1000');
    expect(query.error).toMatch(/mínimo.*máximo/);
    expect(selectProducts(products, query)).toHaveLength(products.length);
  });

  it('limita el texto y serializa céntimos exactos con nombres canónicos', () => {
    expect(parse(`buscar=${'x'.repeat(101)}`).q).toHaveLength(100);
    const query = parse('q=plata&min=0&max=90071992547409,91&orden=precio-asc');
    const encoded = serializeCatalogQuery(query);
    expect(encoded.toString()).toBe('buscar=plata&min=0&max=90071992547409.91&orden=precio-asc');
    expect(parseCatalogQuery(encoded)).toEqual(query);
  });
});

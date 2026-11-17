import catalog from '../data/products.json';
import { isProductList } from '../utils/catalogContract';

const records: unknown = catalog.productos;
if (!isProductList(records)) throw new Error('El catálogo de prueba no cumple el contrato');
export const products = records;
export const byId = new Map(products.map((product) => [product.id, product]));

export function catalogResponse(input: RequestInfo | URL): Response {
  const path = String(input);
  if (path === '/api/auth/session') return Response.json({ profile: null });
  if (path === '/api/productos') return Response.json(products);
  if (!path.startsWith('/api/productos/')) throw new Error('Solicitud inesperada: ' + path);
  const product = byId.get(path.slice('/api/productos/'.length));
  return product ? Response.json(product) : Response.json({ error: 'No encontrado' }, { status: 404 });
}

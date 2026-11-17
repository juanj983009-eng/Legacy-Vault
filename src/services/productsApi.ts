import type { Product } from '../types/catalog';
import { isProduct, isProductId, isProductList } from '../utils/catalogContract';

function request(path: string, signal: AbortSignal) {
  return fetch('/api/productos' + path, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
  });
}

async function readJson(response: Response): Promise<unknown> {
  if (!response.ok || !/^application\/json\b/i.test(response.headers.get('content-type') ?? '')) {
    throw new Error('Respuesta inválida del catálogo');
  }
  return response.json();
}

export async function getProducts(signal: AbortSignal): Promise<readonly Product[]> {
  const data = await readJson(await request('', signal));
  if (!isProductList(data)) throw new Error('Catálogo inválido');
  return data;
}

export async function getProductById(id: string, signal: AbortSignal): Promise<Product | null> {
  if (!isProductId(id)) return null;
  const response = await request('/' + encodeURIComponent(id), signal);
  if (response.status === 404 && /^application\/json\b/i.test(response.headers.get('content-type') ?? '')) return null;
  const data = await readJson(response);
  if (!isProduct(data) || data.id !== id) throw new Error('Pieza inválida');
  return data;
}

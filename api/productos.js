import catalog from '../src/data/products.json' with { type: 'json' };

export default function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.statusCode = 405;
    response.end(JSON.stringify({ error: 'Método no permitido' }));
    return;
  }

  const url = new URL(request.url, 'http://localhost');
  const id = url.pathname.startsWith('/api/productos/')
    ? url.pathname.slice('/api/productos/'.length)
    : url.searchParams.get('id');
  const product = id === null ? catalog.productos : catalog.productos.find((entry) => entry.id === id);
  response.statusCode = product === undefined ? 404 : 200;
  response.end(JSON.stringify(product ?? { error: 'Pieza no encontrada' }));
}

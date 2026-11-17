import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createApp } from 'json-server/lib/app.js';
import catalog from '../src/data/products.json' with { type: 'json' };
import { createAccounts } from './accounts.mjs';

const databasePath = resolve(process.env.LEGACY_VAULT_DATABASE ?? '.data/accounts.sqlite');
mkdirSync(dirname(databasePath), { recursive: true, mode: 0o700 });
const accounts = createAccounts(databasePath);
const app = createApp({ data: catalog });
createServer({ requestTimeout: 15_000, headersTimeout: 5_000 }, (request, response) => {
  if (request.url?.startsWith('/auth/')) {
    void accounts(request, response).catch(() => {
      if (response.headersSent) { response.destroy(); return; }
      response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ error: 'No se pudo completar la solicitud' }));
    });
    return;
  }
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' }).end(JSON.stringify({ error: 'Método no permitido' }));
    return;
  }
  if (!/^\/productos(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(request.url) || request.url.length > 92) {
    response.writeHead(404).end(JSON.stringify({ error: 'Recurso no encontrado' }));
    return;
  }
  void app.handler(request, response);
}).listen(3001, '127.0.0.1', () => {
  console.log('Catálogo y cuentas en http://127.0.0.1:3001');
});

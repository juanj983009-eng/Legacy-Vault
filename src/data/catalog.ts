import type { Category } from '../types/catalog';

export const categories: readonly Category[] = [
  { id: 'relojes', name: 'Relojes vintage' },
  { id: 'monedas', name: 'Monedas históricas' },
  { id: 'camaras', name: 'Cámaras antiguas' },
  { id: 'antiguedades', name: 'Antigüedades y coleccionables' },
];

export const featuredProductIds: readonly string[] = [
  'reloj-bolsillo-suizo', 'moneda-carlos-iii', 'telemetro-mecanico', 'brujula-cardanica',
];


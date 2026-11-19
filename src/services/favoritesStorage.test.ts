import { afterEach, describe, expect, it, vi } from 'vitest';
import { FAVORITES_STORAGE_KEY, loadFavorites, saveFavorites } from './favoritesStorage';

const WATCH_ID = 'reloj-bolsillo-suizo';
const CAMERA_ID = 'camara-kodak-brownie';

afterEach(() => localStorage.clear());

describe('persistencia de favoritos', () => {
  it('solo guarda versión e identificadores y recupera los favoritos', () => {
    expect(saveFavorites([WATCH_ID, CAMERA_ID])).toBeUndefined();
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
      version: 1,
      items: [WATCH_ID, CAMERA_ID],
    });
    expect(loadFavorites().items).toEqual([WATCH_ID, CAMERA_ID]);
  });

  it('descarta identificadores mal formados y duplicados', () => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({
      version: 1,
      items: [null, '', 123, WATCH_ID, WATCH_ID, 'ID_INVALIDO!', CAMERA_ID],
    }));
    expect(loadFavorites()).toEqual({
      items: [WATCH_ID, CAMERA_ID],
      warning: expect.any(String),
    });
  });

  it.each(['{', '{"version":2,"items":[]}', '{"version":1,"items":{}}', 'x'.repeat(10241)])(
    'recupera lista vacía con aviso cuando la estructura es inválida o supera el límite',
    (raw) => {
      localStorage.setItem(FAVORITES_STORAGE_KEY, raw);
      expect(loadFavorites()).toMatchObject({ items: [], warning: expect.any(String) });
    },
  );

  it('devuelve aviso si el navegador deniega lectura o escritura', () => {
    const read = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denegado'); });
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('cuota'); });
    expect(loadFavorites()).toMatchObject({ items: [], warning: expect.any(String) });
    expect(saveFavorites([WATCH_ID])).toMatch(/guardar/i);
    read.mockRestore();
    write.mockRestore();
  });
});

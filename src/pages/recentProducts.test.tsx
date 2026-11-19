import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import {
  MAX_RECENT_PRODUCTS,
  RECENT_PRODUCTS_STORAGE_KEY,
  loadRecentProductIds,
} from '../services/recentProductsStorage';

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

function open(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Productos vistos recientemente (RecentProductsSection & Navigation)', () => {
  it('al abrir el detalle de un producto válido registra su identificador en el historial de recientes', async () => {
    open('/producto/reloj-bolsillo-suizo');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Reloj de Bolsillo Suizo (c. 1912)',
      })
    ).toBeVisible();

    await waitFor(() => {
      const recent = loadRecentProductIds();
      expect(recent.items).toEqual(['reloj-bolsillo-suizo']);
    });
  });

  it('al abrir un detalle inexistente o no válido no registra ningún identificador', async () => {
    open('/producto/pieza-ficticia-inexistente');

    expect(await screen.findByText('Esta pieza no está en el catálogo.')).toBeVisible();

    const recent = loadRecentProductIds();
    expect(recent.items).toEqual([]);
  });

  it('en el detalle de producto excluye la pieza actual de la sección de recientes', async () => {
    localStorage.setItem(
      RECENT_PRODUCTS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: ['moneda-carlos-iii', 'reloj-bolsillo-suizo'],
      })
    );

    open('/producto/reloj-bolsillo-suizo');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Reloj de Bolsillo Suizo (c. 1912)',
      })
    ).toBeVisible();

    const recentHeading = await screen.findByRole('heading', {
      name: 'Vistos recientemente',
    });
    expect(recentHeading).toBeVisible();

    const recentSection = recentHeading.closest('section')!;
    expect(
      within(recentSection).getByRole('link', { name: /Carlos III/i })
    ).toBeVisible();

    // La pieza actual NO debe aparecer en la sección de recientes
    expect(
      within(recentSection).queryByRole('link', { name: /Reloj de Bolsillo Suizo/i })
    ).toBeNull();
  });

  it('si no hay piezas recientes para mostrar tras excluir la actual no muestra una sección vacía', async () => {
    // Primera visita a la tienda
    open('/producto/reloj-bolsillo-suizo');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Reloj de Bolsillo Suizo (c. 1912)',
      })
    ).toBeVisible();

    // No debe existir la sección "Vistos recientemente"
    expect(screen.queryByRole('heading', { name: 'Vistos recientemente' })).toBeNull();
  });

  it('en Inicio muestra la sección de vistos recientemente cuando hay productos consultados y la oculta si está vacío', async () => {
    // 1. Sin visitas previas: Inicio no muestra la sección
    open('/');
    expect(await screen.findByRole('heading', { name: /Cada objeto tiene una/i })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Vistos recientemente' })).toBeNull();

    cleanup();

    // 2. Con historial previo en localStorage
    localStorage.setItem(
      RECENT_PRODUCTS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: ['reloj-bolsillo-suizo', 'moneda-carlos-iii'],
      })
    );

    open('/');
    const recentHeading = await screen.findByRole('heading', { name: 'Vistos recientemente' });
    expect(recentHeading).toBeVisible();

    const recentSection = recentHeading.closest('section')!;
    expect(within(recentSection).getByRole('link', { name: /Reloj de Bolsillo Suizo/i })).toBeVisible();
    expect(within(recentSection).getByRole('link', { name: /Carlos III/i })).toBeVisible();
  });

  it('muestra únicamente productos presentes en el catálogo disponible sin borrar el historial si hay piezas incompletas', async () => {
    const rawHistory = JSON.stringify({
      version: 1,
      items: ['reloj-bolsillo-suizo', 'pieza-que-no-existe-en-catalogo'],
    });
    localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, rawHistory);

    open('/');

    const recentHeading = await screen.findByRole('heading', { name: 'Vistos recientemente' });
    const recentSection = recentHeading.closest('section')!;

    // Muestra la pieza existente
    expect(within(recentSection).getByRole('link', { name: /Reloj de Bolsillo Suizo/i })).toBeVisible();

    // No inventa ni muestra la que no existe
    expect(within(recentSection).queryByText('pieza-que-no-existe-en-catalogo')).toBeNull();

    // El historial en localStorage NO fue borrado ni alterado
    expect(localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY)).toBe(rawHistory);
  });

  it('si todas las piezas del historial no están en el catálogo disponible no muestra sección vacía ni borra el historial', async () => {
    const rawHistory = JSON.stringify({
      version: 1,
      items: ['pieza-inexistente-1', 'pieza-inexistente-2'],
    });
    localStorage.setItem(RECENT_PRODUCTS_STORAGE_KEY, rawHistory);

    open('/');

    expect(await screen.findByRole('heading', { name: /Cada objeto tiene una/i })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Vistos recientemente' })).toBeNull();

    // El historial se preserva intacto
    expect(localStorage.getItem(RECENT_PRODUCTS_STORAGE_KEY)).toBe(rawHistory);
  });

  it('mantiene el límite máximo de seis piezas y reorganiza por última consulta sin duplicar', async () => {
    localStorage.setItem(
      RECENT_PRODUCTS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [
          'reloj-bolsillo-suizo',
          'moneda-carlos-iii',
          'telemetro-mecanico',
          'brujula-cardanica',
          'astrolabio-nautico',
          'reloj-caza-laton',
        ],
      })
    );

    // Visitar la 7ma pieza distinta
    open('/producto/camara-plegable-fuelle');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Cámara Plegable de Fuelle/i,
      })
    ).toBeVisible();

    await waitFor(() => {
      const stored = loadRecentProductIds().items;
      expect(stored).toHaveLength(MAX_RECENT_PRODUCTS);
      expect(stored[0]).toBe('camara-plegable-fuelle');
      expect(stored).not.toContain('reloj-caza-laton'); // La más antigua fue desplazada
    });

    // Re-visitar 'reloj-bolsillo-suizo'
    cleanup();
    open('/producto/reloj-bolsillo-suizo');
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Reloj de Bolsillo Suizo (c. 1912)',
      })
    ).toBeVisible();

    await waitFor(() => {
      const updated = loadRecentProductIds().items;
      expect(updated).toHaveLength(MAX_RECENT_PRODUCTS);
      expect(updated[0]).toBe('reloj-bolsillo-suizo');
      expect(new Set(updated).size).toBe(MAX_RECENT_PRODUCTS); // Sin duplicados
    });
  });

  it('gestiona fallos al guardar por cuota de almacenamiento sin interrumpir la experiencia de usuario', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    open('/producto/reloj-bolsillo-suizo');

    // La página carga y funciona normalmente
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Reloj de Bolsillo Suizo (c. 1912)',
      })
    ).toBeVisible();
  });
});

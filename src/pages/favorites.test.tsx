import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { FAVORITES_STORAGE_KEY } from '../services/favoritesStorage';
import { products } from '../test/catalogFixture';

afterEach(() => localStorage.clear());

const watch = 'Reloj de Bolsillo Suizo (c. 1912)';
const watchId = 'reloj-bolsillo-suizo';
const coin = '8 Reales de Plata Carlos III (1783)';
const coinId = 'moneda-carlos-iii';

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

function favoritesLink() {
  return within(
    screen.getByRole('navigation', { name: 'Navegación principal' })
  ).getByRole('link', { name: /^Favoritos \d/ });
}

describe('favoritos en las rutas reales', () => {
  it('muestra el estado vacío cuidado con enlace al catálogo si no hay favoritos', async () => {
    open('/favoritos');
    expect(screen.getByRole('heading', { name: 'Favoritos', level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('No tienes piezas guardadas en favoritos.')).toBeVisible();
    const catalogLink = within(screen.getByRole('main')).getByRole('link', { name: /Explorar catálogo/i });
    expect(catalogLink).toHaveAttribute('href', '/catalogo');
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 0 piezas');
  });

  it('agrega desde catálogo y ficha, actualiza Navbar, persiste y recupera tras recargar', async () => {
    const user = userEvent.setup();
    const app = open('/catalogo?categoria=relojes');

    // Estado inicial en Navbar
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 0 piezas');

    // Agregar desde tarjeta de catálogo
    const favButton = await screen.findByRole('button', { name: `Guardar en favoritos: ${watch}` });
    expect(favButton).toHaveAttribute('aria-pressed', 'false');
    await user.click(favButton);

    // Debe mostrar claramente que ya está guardada
    expect(screen.getByRole('button', { name: `Quitar de favoritos: ${watch}` })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');
    expect(screen.getByRole('status', { name: 'Cambios en favoritos' })).toHaveTextContent(/guardó.*reloj/i);

    // Navegar a la ficha de producto y verificar coherencia
    await user.click(screen.getByRole('link', { name: watch }));
    const detailFavBtn = await screen.findByRole('button', { name: `Quitar de favoritos: ${watch}` });
    expect(detailFavBtn).toBeInTheDocument();
    expect(detailFavBtn).toHaveAttribute('aria-pressed', 'true');
    expect(detailFavBtn).toHaveTextContent('En favoritos');

    // Quitar desde la ficha
    await user.click(detailFavBtn);
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 0 piezas');
    expect(screen.getByRole('button', { name: `Guardar en favoritos: ${watch}` })).toHaveTextContent(
      'Guardar en favoritos'
    );

    // Volver a agregar desde la ficha
    await user.click(screen.getByRole('button', { name: `Guardar en favoritos: ${watch}` }));
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');

    // Verificar persistencia en localStorage
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
        version: 1,
        items: [watchId],
      });
    });

    // Remontar en la página de favoritos para simular recarga
    app.unmount();
    open('/favoritos');

    expect(await screen.findByRole('heading', { name: /Piezas guardadas \(1\)/i })).toBeInTheDocument();
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');
    expect(screen.getByRole('link', { name: watch })).toBeInTheDocument();
  });

  it('quita favoritos desde la página de favoritos y vacía la lista', async () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [watchId, coinId] })
    );

    const user = userEvent.setup();
    open('/favoritos');

    expect(await screen.findByRole('heading', { name: /Piezas guardadas \(2\)/i })).toBeInTheDocument();
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 2 piezas');

    // Quitar un favorito mediante el botón de la tarjeta
    const removeWatchBtn = screen.getByRole('button', { name: `Quitar de favoritos: ${watch}` });
    await user.click(removeWatchBtn);

    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');
    expect(screen.getByRole('heading', { name: /Piezas guardadas \(1\)/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: watch })).toBeNull();
    expect(screen.getByRole('link', { name: coin })).toBeInTheDocument();

    // Vaciar favoritos completamente
    const clearBtn = screen.getByRole('button', { name: 'Vaciar favoritos' });
    await user.click(clearBtn);

    expect(favoritesLink()).toHaveAccessibleName('Favoritos 0 piezas');
    expect(await screen.findByText('No tienes piezas guardadas en favoritos.')).toBeVisible();
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
        version: 1,
        items: [],
      });
    });
  });

  it('conserva favoritos persistidos cuando la API falla y mantiene visible la opción de vaciar favoritos', async () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [watchId, coinId] })
    );

    // Simular error 503 en la API de catálogo
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({}, { status: 503 }));
    open('/favoritos');

    expect(await screen.findByRole('alert')).toHaveTextContent(/no pudimos cargar los datos del catálogo/i);
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeVisible();
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 2 piezas');
    expect(screen.getByRole('button', { name: 'Vaciar favoritos' })).toBeVisible();

    // Comprobar que los favoritos siguen persistidos intactos
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
      version: 1,
      items: [watchId, coinId],
    });
  });

  it('permite vaciar explícitamente los favoritos ante fallo de la API', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [watchId] })
    );

    // Simular error en la API
    vi.mocked(fetch).mockResolvedValueOnce(Response.json({}, { status: 503 }));
    open('/favoritos');

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');

    const clearBtn = screen.getByRole('button', { name: 'Vaciar favoritos' });
    await user.click(clearBtn);

    expect(favoritesLink()).toHaveAccessibleName('Favoritos 0 piezas');
    expect(await screen.findByText('No tienes piezas guardadas en favoritos.')).toBeVisible();
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
        version: 1,
        items: [],
      });
    });
  });

  it('conserva favoritos persistidos ante catálogo vacío, parcial o error, y los recupera al restaurarse el catálogo', async () => {
    const user = userEvent.setup();
    const coinProduct = products.find((p) => p.id === coinId)!;

    // Estado inicial: 2 favoritos persistidos
    const initialFavorites = [watchId, coinId];
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: initialFavorites })
    );

    // 1. Simular catálogo vacío (la API responde lista vacía [])
    vi.mocked(fetch).mockResolvedValueOnce(Response.json([]));
    const emptyApp = open('/favoritos');

    expect(await screen.findByText(/el catálogo aún no tiene piezas disponibles/i)).toBeVisible();
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 2 piezas');
    // Mantiene visible la opción de vaciar favoritos ante catálogo vacío
    expect(screen.getByRole('button', { name: 'Vaciar favoritos' })).toBeVisible();
    // No debe confundir catálogo vacío con "no tienes piezas guardadas en favoritos"
    expect(screen.queryByText('No tienes piezas guardadas en favoritos.')).not.toBeInTheDocument();
    // La persistencia no debe borrarse
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
      version: 1,
      items: initialFavorites,
    });
    emptyApp.unmount();

    // 2. Simular catálogo parcial (la API solo devuelve 'coinProduct', falta 'watchId')
    vi.mocked(fetch).mockResolvedValueOnce(Response.json([coinProduct]));
    const partialApp = open('/favoritos');

    // Muestra solo la pieza disponible para renderizar
    expect(await screen.findByRole('heading', { name: /Piezas guardadas \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: coin })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: watch })).toBeNull();
    // El contador de Navbar y la persistencia no borran la pieza temporalmente ausente
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 2 piezas');
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
      version: 1,
      items: initialFavorites,
    });

    // Permite quitar explícitamente la pieza visible sin borrar la pieza ausente
    const removeCoinBtn = screen.getByRole('button', { name: `Quitar de favoritos: ${coin}` });
    await user.click(removeCoinBtn);

    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');
    // En localStorage debe quedar watchId (no se eliminó por ausencia)
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
      version: 1,
      items: [watchId],
    });
    partialApp.unmount();

    // 3. Simular recuperación total del catálogo
    const recoveredApp = open('/favoritos');
    expect(await screen.findByRole('heading', { name: /Piezas guardadas \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: watch })).toBeInTheDocument();
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');
    expect(JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual({
      version: 1,
      items: [watchId],
    });
    recoveredApp.unmount();
  });

  it('permite navegación con teclado y accesibilidad aria', async () => {
    const user = userEvent.setup();
    open('/catalogo?categoria=relojes');

    const favButton = await screen.findByRole('button', { name: `Guardar en favoritos: ${watch}` });
    favButton.focus();
    expect(favButton).toHaveFocus();

    // Activar con tecla Espacio
    await user.keyboard(' ');
    expect(screen.getByRole('button', { name: `Quitar de favoritos: ${watch}` })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(favoritesLink()).toHaveAccessibleName('Favoritos 1 pieza');
  });
});

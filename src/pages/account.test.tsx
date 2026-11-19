import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { CART_STORAGE_KEY } from '../services/cartStorage';
import { FAVORITES_STORAGE_KEY } from '../services/favoritesStorage';
import { catalogResponse } from '../test/catalogFixture';

afterEach(() => localStorage.clear());

function open(path = '/login') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Pantalla de Mi cuenta (LoginPage)', () => {
  it('muestra estado de comprobando sesión cuando la verificación está en progreso', () => {
    // Retrasar respuesta de sesión para comprobar el estado de carga
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise<Response>(() => { /* pendiente */ })
    );

    open('/login');
    expect(screen.getByText('Comprobando sesión…')).toBeVisible();
  });

  it('permite entrar como visitante y muestra identidad, accesos y contadores en cero', async () => {
    const user = userEvent.setup();
    open('/login');

    // Entrar como visitante
    const guestBtn = await screen.findByRole('button', { name: 'Entrar como visitante' });
    await user.click(guestBtn);

    // Identidad del visitante
    expect(await screen.findByRole('heading', { name: 'Mi cuenta', level: 1 })).toBeVisible();
    expect(screen.getByText('Modo visitante')).toBeVisible();
    expect(screen.getByText('Visitante')).toBeVisible();
    expect(
      screen.getByText(/navegación temporal sin cuenta/i)
    ).toBeVisible();

    // Accesos funcionales con contadores en cero (estados vacíos claros)
    const nav = screen.getByRole('navigation', { name: 'Accesos de la cuenta' });
    const favLink = within(nav).getByRole('link', { name: /mis favoritos/i });
    expect(favLink).toHaveAttribute('href', '/favoritos');
    expect(within(favLink).getByText('Sin piezas guardadas')).toBeVisible();

    const cartLink = within(nav).getByRole('link', { name: /mi carrito/i });
    expect(cartLink).toHaveAttribute('href', '/carrito');
    expect(within(cartLink).getByText('Sin piezas seleccionadas')).toBeVisible();

    const ordersLink = within(nav).getByRole('link', { name: /mis pedidos/i });
    expect(ordersLink).toHaveAttribute('href', '/pedidos');
    expect(within(ordersLink).getByText('Sin pedidos registrados')).toBeVisible();

    const colLink = within(nav).getByRole('link', { name: /colecciones/i });
    expect(colLink).toHaveAttribute('href', '/colecciones');

    const catLink = within(nav).getByRole('link', { name: /catálogo/i });
    expect(catLink).toHaveAttribute('href', '/catalogo');

    // Opción para salir del perfil
    const exitBtn = screen.getByRole('button', { name: 'Salir del perfil' });
    await user.click(exitBtn);
    expect(await screen.findByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  it('muestra cuenta autenticada con iniciales, correo y contadores dinámicos sincronizados', async () => {
    const user = userEvent.setup();

    // Guardar 2 favoritos y 3 unidades en el carrito
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: ['reloj-bolsillo-suizo', 'moneda-carlos-iii'] })
    );
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [{ productId: 'reloj-bolsillo-suizo', quantity: 3 }],
      })
    );

    // Simular sesión autenticada al cargar
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path === '/api/auth/session') {
        return Response.json({ profile: { alias: 'Helena Drake', email: 'helena@example.com' } });
      }
      return catalogResponse(input);
    });

    open('/login');

    // Identidad autenticada
    expect(await screen.findByRole('heading', { name: 'Mi cuenta', level: 1 })).toBeVisible();
    expect(screen.getByText('Perfil registrado')).toBeVisible();
    expect(screen.getByText('Helena Drake')).toBeVisible();
    expect(screen.getByText('helena@example.com')).toBeVisible();
    expect(within(screen.getByRole('main')).getByText('HD')).toBeVisible();

    // Contadores reales sincronizados
    const nav = screen.getByRole('navigation', { name: 'Accesos de la cuenta' });
    expect(within(nav).getByText('2 piezas guardadas')).toBeVisible();
    expect(within(nav).getByText('3 piezas seleccionadas')).toBeVisible();

    // Navegación a favoritos
    const favLink = within(nav).getByRole('link', { name: /mis favoritos/i });
    await user.click(favLink);
    expect(await screen.findByRole('heading', { name: 'Favoritos', level: 1 })).toBeVisible();
  });

  it('muestra correctamente el contador en singular con 1 pieza', async () => {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: ['reloj-bolsillo-suizo'] })
    );
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        items: [{ productId: 'reloj-bolsillo-suizo', quantity: 1 }],
      })
    );

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path === '/api/auth/session') {
        return Response.json({ profile: { alias: 'Ana M.', email: 'ana@example.com' } });
      }
      return catalogResponse(input);
    });

    open('/login');

    const nav = await screen.findByRole('navigation', { name: 'Accesos de la cuenta' });
    expect(within(nav).getByText('1 pieza guardada')).toBeVisible();
    expect(within(nav).getByText('1 pieza seleccionada')).toBeVisible();
  });

  it('conserva el cierre de sesión y muestra alerta si el logout falla', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      const path = String(input);
      if (path === '/api/auth/session') {
        return Response.json({ profile: { alias: 'Carlos V.', email: 'carlos@example.com' } });
      }
      if (path === '/api/auth/logout') {
        return Response.json({ error: 'Fallo temporal' }, { status: 500 });
      }
      return catalogResponse(input);
    });

    open('/login');

    const signOutBtn = await screen.findByRole('button', { name: 'Cerrar sesión' });
    await user.click(signOutBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo cerrar la sesión. Inténtalo de nuevo.'
    );
  });
});

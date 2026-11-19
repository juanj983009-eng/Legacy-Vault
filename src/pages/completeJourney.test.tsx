import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { CART_STORAGE_KEY } from '../services/cartStorage';
import { FAVORITES_STORAGE_KEY } from '../services/favoritesStorage';
import { ORDERS_STORAGE_KEY } from '../services/ordersStorage';
import { RECENT_PRODUCTS_STORAGE_KEY } from '../services/recentProductsStorage';

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

describe('LEGACY VAULT — Recorrido completo de usuario de principio a fin', () => {
  it('ejecuta el flujo completo: Inicio -> Catálogo -> Búsqueda/Filtro -> Detalle -> Favoritos -> Carrito -> Cantidad -> Checkout -> Pedidos -> Vistos recientemente -> Mi cuenta', async () => {
    const user = userEvent.setup();

    // ==========================================================
    // 1. Entrar a Inicio y abrir el catálogo
    // ==========================================================
    open('/');

    // Hero title
    const heroHeading = await screen.findByRole('heading', { name: /Cada objeto tiene una/i });
    expect(heroHeading).toBeVisible();

    // CTA en Hero a catálogo
    const heroSection = heroHeading.closest('section')!;
    const catalogCta = within(heroSection).getByRole('link', { name: /Explorar catálogo/i });
    expect(catalogCta).toHaveAttribute('href', '/catalogo');

    // Navegar al catálogo
    await user.click(catalogCta);
    expect(await screen.findByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible();

    // ==========================================================
    // 2. Buscar y filtrar una pieza
    // ==========================================================
    const searchInput = screen.getByRole('searchbox', { name: /Buscar productos/i });
    await user.type(searchInput, 'reloj');
    await user.keyboard('{Enter}');

    // Comprobar que las tarjetas filtradas contienen relojes
    const grid = await screen.findByRole('list', { name: 'Productos del catálogo' });
    const productLinks = within(grid).getAllByRole('link', { name: /Reloj/i });
    expect(productLinks.length).toBeGreaterThan(0);

    // ==========================================================
    // 3. Abrir su detalle y guardarla en favoritos
    // ==========================================================
    const watchLink = within(grid).getByRole('link', { name: 'Reloj de Bolsillo Suizo (c. 1912)' });
    await user.click(watchLink);

    // Verificación de ficha de producto
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Reloj de Bolsillo Suizo (c. 1912)',
      })
    ).toBeVisible();

    // Guardar en favoritos
    const favBtn = screen.getByRole('button', { name: /Guardar en favoritos: Reloj de Bolsillo Suizo/i });
    expect(favBtn).toHaveTextContent('Guardar en favoritos');
    await user.click(favBtn);

    // Confirmación visual del botón de favoritos
    expect(screen.getByRole('button', { name: /Quitar de favoritos: Reloj de Bolsillo Suizo/i })).toHaveTextContent(
      'En favoritos'
    );

    // Comprobar que en Navbar el enlace a favoritos existe
    const favNavLink = screen.getByRole('link', { name: /Favoritos/i });
    expect(favNavLink).toBeVisible();

    // ==========================================================
    // 4. Agregarla al carrito y cambiar la cantidad
    // ==========================================================
    const addToCartBtn = screen.getByRole('button', { name: /Agregar al carrito: Reloj de Bolsillo Suizo/i });
    await user.click(addToCartBtn);

    // Navegar al carrito desde el Navbar
    const cartNavLink = screen.getByRole('link', { name: /Carrito/i });
    await user.click(cartNavLink);

    // Verificación de página del carrito
    expect(await screen.findByRole('heading', { level: 1, name: 'Carrito' })).toBeVisible();
    expect(screen.getByText('Reloj de Bolsillo Suizo (c. 1912)')).toBeVisible();

    // Cambiar cantidad de 1 a 2
    const increaseBtn = screen.getByRole('button', { name: /Aumentar cantidad de Reloj de Bolsillo Suizo/i });
    await user.click(increaseBtn);

    // Comprobar total actualizado (2450 * 2 = 4900)
    expect(screen.getAllByText(/4,900.00/).length).toBeGreaterThan(0);

    // ==========================================================
    // 5. Completar el checkout simulado
    // ==========================================================
    const checkoutLink = screen.getByRole('link', { name: 'Continuar con la compra' });
    await user.click(checkoutLink);

    expect(await screen.findByRole('heading', { level: 1, name: 'Finaliza tu pedido' })).toBeVisible();

    // Llenar datos de contacto de prueba
    await user.type(await screen.findByLabelText('Nombre del comprador'), 'Elena Coleccionista');
    await user.type(screen.getByLabelText('Correo electrónico'), 'elena@ejemplo.com');
    await user.type(screen.getByLabelText('Dirección'), 'Calle Los Anticuarios 123');
    await user.type(screen.getByLabelText('Ciudad o distrito'), 'Miraflores');
    await user.type(screen.getByLabelText('Teléfono'), '987654321');

    // Revisar pedido
    await user.click(screen.getByRole('button', { name: 'Revisar pedido' }));
    expect(await screen.findByRole('heading', { name: 'Revisa tu pedido' })).toBeVisible();
    expect(screen.getByText('Al confirmar no se realizará ningún cobro ni envío.')).toBeVisible();

    // Confirmar pedido
    await user.click(screen.getByRole('button', { name: 'Confirmar pedido' }));

    // Verificación de confirmación
    expect(await screen.findByRole('heading', { level: 2, name: 'Pedido confirmado' })).toBeVisible();
    const orderNumberEl = screen.getByText(/^DEMO-[A-F0-9]{16}$/);
    expect(orderNumberEl).toBeVisible();
    const confirmedOrderId = orderNumberEl.textContent!;

    // Mensaje de guardado en historial
    expect(screen.getByText(/el resumen del pedido se ha guardado en el historial de este navegador/i)).toBeVisible();

    // ==========================================================
    // 6. Consultar el pedido en «Mis pedidos»
    // ==========================================================
    const ordersLink = screen.getByRole('link', { name: 'Ver mis pedidos' });
    await user.click(ordersLink);

    expect(await screen.findByRole('heading', { level: 1, name: 'Mis pedidos' })).toBeVisible();
    expect(screen.getByText(confirmedOrderId)).toBeVisible();
    expect(screen.getByText('Reloj de Bolsillo Suizo (c. 1912)')).toBeVisible();
    expect(screen.getAllByText(/4,900.00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/1 pedido guardado/i)).toBeVisible();

    // ==========================================================
    // 7. Volver a Inicio y comprobar «Vistos recientemente»
    // ==========================================================
    const homeNavLink = screen.getByRole('link', { name: 'Inicio' });
    await user.click(homeNavLink);

    expect(await screen.findByRole('heading', { name: /Cada objeto tiene una/i })).toBeVisible();

    // La sección "Vistos recientemente" debe estar presente con el reloj consultado
    const recentHeading = await screen.findByRole('heading', { name: 'Vistos recientemente' });
    expect(recentHeading).toBeVisible();
    const recentSection = recentHeading.closest('section')!;
    expect(within(recentSection).getByRole('link', { name: /Reloj de Bolsillo Suizo/i })).toBeVisible();

    // ==========================================================
    // 8. Revisar «Mi cuenta» y sus accesos
    // ==========================================================
    const accountLink = screen.getByRole('link', { name: 'Login' });
    await user.click(accountLink);

    expect(await screen.findByRole('heading', { level: 1, name: 'Acceso' })).toBeVisible();

    // Entrar como visitante
    const guestBtn = screen.getByRole('button', { name: 'Entrar como visitante' });
    await user.click(guestBtn);

    // Comprobar contadores en Mi Cuenta
    expect(await screen.findByRole('heading', { level: 1, name: 'Mi cuenta' })).toBeVisible();
    expect(await screen.findByText('1 pieza guardada')).toBeVisible(); // Favorito guardado
    expect(screen.getByText('1 pedido simulado')).toBeVisible(); // Pedido confirmado
    expect(screen.getByText('Sin piezas seleccionadas')).toBeVisible(); // Carrito vaciado tras checkout
  });

  it('comprueba estados vacíos limpios y cuidados para Carrito, Favoritos y Pedidos sin dejar secciones rotas', async () => {
    // 1. Carrito vacío
    open('/carrito');
    expect(await screen.findByRole('heading', { level: 1, name: 'Carrito' })).toBeVisible();
    expect(screen.getByText('Tu carrito está vacío.')).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Explorar catálogo/i }).length).toBeGreaterThanOrEqual(1);

    cleanup();

    // 2. Favoritos vacíos
    open('/favoritos');
    expect(await screen.findByRole('heading', { level: 1, name: 'Favoritos' })).toBeVisible();
    expect(screen.getByText('No tienes piezas guardadas en favoritos.')).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Explorar catálogo/i }).length).toBeGreaterThanOrEqual(1);

    cleanup();

    // 3. Pedidos vacíos
    open('/pedidos');
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis pedidos' })).toBeVisible();
    expect(screen.getByText('No tienes pedidos registrados.')).toBeVisible();
    expect(screen.getAllByRole('link', { name: /Explorar catálogo/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('conserva todos los datos tras una recarga de página (persistencia completa)', async () => {
    // Simular almacenamiento previo completo
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ version: 1, items: ['reloj-bolsillo-suizo'] })
    );
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ version: 1, items: [{ productId: 'moneda-carlos-iii', quantity: 2 }] })
    );
    localStorage.setItem(
      RECENT_PRODUCTS_STORAGE_KEY,
      JSON.stringify({ version: 1, items: ['telemetro-mecanico'] })
    );
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        orders: [
          {
            id: 'DEMO-RELOAD00000001',
            createdAt: '2026-11-18T10:00:00.000Z',
            lines: [
              {
                productId: 'reloj-bolsillo-suizo',
                name: 'Reloj de Bolsillo Suizo (c. 1912)',
                quantity: 1,
                subtotalCents: 245000,
              },
            ],
            totals: {
              itemCount: 1,
              subtotalCents: 245000,
              shippingCents: 0,
              totalCents: 245000,
            },
          },
        ],
      })
    );

    // Montar en favoritos
    open('/favoritos');
    expect(await screen.findByRole('heading', { level: 1, name: 'Favoritos' })).toBeVisible();
    expect(screen.getByText('Reloj de Bolsillo Suizo (c. 1912)')).toBeVisible();

    cleanup();

    // Montar en carrito
    open('/carrito');
    expect(await screen.findByRole('heading', { level: 1, name: 'Carrito' })).toBeVisible();
    expect(screen.getByText(/8 Reales de Plata Carlos III/i)).toBeVisible();

    cleanup();

    // Montar en pedidos
    open('/pedidos');
    expect(await screen.findByRole('heading', { level: 1, name: 'Mis pedidos' })).toBeVisible();
    expect(screen.getByText('DEMO-RELOAD00000001')).toBeVisible();

    cleanup();

    // Montar en inicio
    open('/');
    const recentHeading = await screen.findByRole('heading', { name: 'Vistos recientemente' });
    expect(recentHeading).toBeVisible();
    expect(within(recentHeading.closest('section')!).getByRole('link', { name: /Telémetro Mecánico/i })).toBeVisible();
  });
});

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { CART_STORAGE_KEY } from '../services/cartStorage';

afterEach(() => localStorage.clear());

const watch = 'Reloj de Bolsillo Suizo (c. 1912)';

function open(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>);
}

function cartLink() {
  return within(screen.getByRole('navigation', { name: 'Navegación principal' })).getByRole('link', { name: /^Carrito \d/ });
}

describe('carrito en las rutas reales', () => {
  it('agrega desde catálogo y ficha, actualiza Navbar, persiste y recupera tras remontar', async () => {
    const user = userEvent.setup();
    const app = open('/catalogo?categoria=relojes');
    await user.click(await screen.findByRole('button', { name: `Agregar ${watch} al carrito` }));
    expect(screen.getByRole('button', { name: `Agregar ${watch} al carrito` })).toHaveTextContent('Agregado');
    expect(cartLink()).toHaveAccessibleName('Carrito 1 unidad');
    expect(screen.getByRole('status', { name: 'Cambios del carrito' })).toHaveTextContent(/agregó/);
    await user.click(screen.getByRole('link', { name: watch }));
    await user.click(await screen.findByRole('button', { name: `Agregar al carrito: ${watch}` }));
    expect(cartLink()).toHaveAccessibleName('Carrito 2 unidades');
    await waitFor(() => expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({
      version: 1, items: [{ productId: 'reloj-bolsillo-suizo', quantity: 2 }],
    }));
    app.unmount();
    open('/carrito');
    expect(cartLink()).toHaveAccessibleName('Carrito 2 unidades');
    expect((await screen.findAllByText(/4,900.00/)).length).toBeGreaterThan(0);
  });

  it('cambia cantidades, elimina y muestra el vacío con aviso accesible', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [{ productId: 'reloj-bolsillo-suizo', quantity: 2 }] }));
    const user = userEvent.setup();
    open('/carrito');
    await user.click(await screen.findByRole('button', { name: `Aumentar cantidad de ${watch}` }));
    expect(cartLink()).toHaveAccessibleName('Carrito 3 unidades');
    await user.click(await screen.findByRole('button', { name: `Disminuir cantidad de ${watch}` }));
    await user.click(await screen.findByRole('button', { name: `Disminuir cantidad de ${watch}` }));
    expect(screen.getByRole('button', { name: `Disminuir cantidad de ${watch}` })).toBeDisabled();
    await user.click(await screen.findByRole('button', { name: `Eliminar ${watch} del carrito` }));
    expect(screen.getByRole('status', { name: 'Cambios del carrito' })).toHaveTextContent(/eliminó/);
    expect(screen.getByText('Tu carrito está vacío.')).toBeVisible();
    expect(within(screen.getByRole('main')).getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/catalogo');
    expect(screen.queryByRole('link', { name: 'Continuar con la compra' })).toBeNull();
  });

  it('vacía el carrito y guarda la selección vacía', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [{ productId: 'reloj-bolsillo-suizo', quantity: 1 }] }));
    const user = userEvent.setup();
    open('/carrito');
    await user.click(await screen.findByRole('button', { name: 'Vaciar carrito' }));
    expect(cartLink()).toHaveAccessibleName('Carrito 0 unidades');
    await waitFor(() => expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({ version: 1, items: [] }));
  });

  it('mantiene la selección en memoria y muestra el aviso si falla la escritura', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('cuota'); });
    const user = userEvent.setup();
    open('/catalogo?categoria=relojes');
    await user.click(await screen.findByRole('button', { name: `Agregar ${watch} al carrito` }));
    await user.click(cartLink());
    expect(await screen.findByText(/no se pudo guardar el carrito/i)).toBeVisible();
    expect(cartLink()).toHaveAccessibleName('Carrito 1 unidad');
    write.mockRestore();
  });

  it('deshabilita productos no disponibles y permite continuar con un carrito con unidades', async () => {
    const user = userEvent.setup();
    open('/catalogo?categoria=relojes');
    expect(await screen.findByRole('button', { name: /No disponible: Reloj de Caza/ })).toBeDisabled();
    await user.click(await screen.findByRole('button', { name: `Agregar ${watch} al carrito` }));
    await user.click(cartLink());
    await user.click(screen.getByRole('link', { name: 'Continuar con la compra' }));
    expect(screen.getByRole('heading', { name: 'Finaliza tu pedido' })).toBeVisible();
    expect(cartLink()).toHaveAccessibleName('Carrito 1 unidad');
  });
});

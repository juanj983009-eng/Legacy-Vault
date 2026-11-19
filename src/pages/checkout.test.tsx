import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { byId, catalogResponse } from '../test/catalogFixture';
import { AppRoutes } from '../app/routes';
import { CART_STORAGE_KEY } from '../services/cartStorage';
import { ORDERS_STORAGE_KEY } from '../services/ordersStorage';
import { createDemoOrder } from '../utils/demoOrder';
import { validateCheckout } from '../utils/validation';

function open(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>);
}

function seedCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [
    { productId: 'reloj-bolsillo-suizo', quantity: 2 },
    { productId: 'moneda-carlos-iii', quantity: 1 },
  ] }));
}

const main = () => within(screen.getByRole('main'));
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('checkout de demostración', () => {
  it('muestra el vacío sin inventar un pedido y permite volver al catálogo', async () => {
    open('/checkout');
    expect(await main().findByText(/carrito está vacío/i)).toBeVisible();
    expect(main().getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/catalogo');
    expect(main().queryByRole('button', { name: /confirmar pedido/i })).toBeNull();
  });

  it('resume líneas, cantidades, subtotales y total del carrito', async () => {
    seedCart();
    open('/checkout');
    const summary = within(await main().findByRole('complementary', { name: 'Resumen del pedido' }));
    expect(summary.getByText('Reloj de Bolsillo Suizo (c. 1912)')).toBeVisible();
    expect(summary.getByText('2 unidades')).toBeVisible();
    expect(summary.getByText(/4,900.00/)).toBeVisible();
    expect(summary.getByText(/1,890.00/)).toBeVisible();
    expect(summary.getByText('Subtotal').nextElementSibling).toHaveTextContent('6,790.00');
    expect(summary.getByText(/Envío/).nextElementSibling).toHaveTextContent('0.00');
    expect(summary.getByText('Total (PEN)').nextElementSibling).toHaveTextContent('6,790.00');
  });

  it('enfoca el primer campo inválido y asocia el error de correo', async () => {
    seedCart();
    const user = userEvent.setup();
    open('/checkout');
    const name = await main().findByRole('textbox', { name: 'Nombre del comprador' });
    const email = main().getByRole('textbox', { name: 'Correo electrónico' });
    const confirm = main().getByRole('button', { name: 'Revisar pedido' });
    expect(main().queryByRole('button', { name: 'Confirmar pedido' })).not.toBeInTheDocument();
    await user.click(confirm);
    expect(name).toHaveFocus();
    expect(name).toHaveAccessibleDescription(/escribe un nombre/i);
    await user.type(name, 'Visitante de prueba');
    await user.type(email, 'sin-arroba');
    await user.click(confirm);
    expect(email).toHaveFocus();
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(/correo válido/i);
    expect(main().queryByText(/DEMO-[A-F0-9]{16}/)).toBeNull();
  });

  it('confirma una vez, conserva el resumen al vaciar y lo descarta al recargar', async () => {
    seedCart();
    const idSource = vi.spyOn(globalThis.crypto, 'getRandomValues');
    const app = open('/checkout');
    fireEvent.change(await main().findByRole('textbox', { name: 'Nombre del comprador' }), { target: { value: 'Visitante de prueba' } });
    fireEvent.change(main().getByRole('textbox', { name: 'Correo electrónico' }), { target: { value: 'demo@example.test' } });
    fireEvent.change(main().getByLabelText('Dirección'), { target: { value: 'Av. Ejemplo 123' } });
    fireEvent.change(main().getByLabelText('Ciudad o distrito'), { target: { value: 'Lima' } });
    fireEvent.change(main().getByLabelText('Teléfono'), { target: { value: '000000000' } });
    fireEvent.click(main().getByRole('button', { name: 'Revisar pedido' }));
    expect(main().getByRole('heading', { name: 'Revisa tu pedido' })).toHaveFocus();
    expect(main().getByText(/Av. Ejemplo 123/)).toBeVisible();
    expect(main().getByText('Al confirmar no se realizará ningún cobro ni envío.')).toBeVisible();
    fireEvent.click(main().getByRole('button', { name: 'Editar datos' }));
    expect(main().getByLabelText('Dirección')).toHaveValue('Av. Ejemplo 123');
    fireEvent.click(main().getByRole('button', { name: 'Revisar pedido' }));
    const confirm = main().getByRole('button', { name: 'Confirmar pedido' });
    act(() => {
      fireEvent.click(confirm);
      fireEvent.click(confirm);
    });
    expect(idSource).toHaveBeenCalledTimes(1);
    expect(main().getByRole('heading', { name: 'Confirmación del pedido' })).toHaveFocus();
    expect(main().getByText(/^DEMO-[A-F0-9]{16}$/)).toBeVisible();
    expect(main().getByText(/Esta confirmación no genera un cobro ni un envío/)).toBeVisible();
    expect(main().getByText('Total (PEN)').nextElementSibling).toHaveTextContent('6,790.00');
    expect(main().queryByText('Visitante de prueba')).toBeNull();
    expect(main().queryByText('demo@example.test')).toBeNull();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({ version: 1, items: [] }));
    expect(localStorage.getItem(ORDERS_STORAGE_KEY)).not.toBeNull();
    expect(localStorage.length).toBe(2);
    expect(sessionStorage.length).toBe(0);
    app.unmount();
    open('/checkout');
    expect(await main().findByText(/carrito está vacío/i)).toBeVisible();
    expect(main().queryByText(/^DEMO-/)).toBeNull();
  });

  it('revalida disponibilidad, cantidad y duplicados antes de crear el resumen', () => {
    const watch = { productId: 'reloj-bolsillo-suizo', quantity: 1 };
    for (const invalid of [[], [{ ...watch, quantity: 0 }], [{ ...watch, quantity: 6 }], [watch, watch], [watch, { productId: 'reloj-caza-laton', quantity: 1 }]]) {
      expect(createDemoOrder(invalid, byId)).toBeUndefined();
    }
  });

  it('acota nombre y correo también fuera de los controles HTML', () => {
    expect(validateCheckout({ name: 'a'.repeat(121), email: 'a'.repeat(250) + '@x.test' }))
      .toEqual({ name: expect.any(String), email: expect.any(String) });
    expect(validateCheckout({ name: ' Ana Demo ', email: ' demo@example.test ' })).toEqual({});
  });
});

describe('acceso demostrativo', () => {
  it('permite entrar y salir como visitante sin crear almacenamiento', async () => {
    const user = userEvent.setup();
    open('/login');
    await user.click(await main().findByRole('button', { name: 'Entrar como visitante' }));
    expect(main().getByText('Visitante')).toBeVisible();
    expect(screen.queryByRole('link', { name: /mi cuenta/i })).toBeNull();
    await user.click(main().getByRole('button', { name: 'Salir del perfil' }));
    expect(main().getByRole('button', { name: 'Entrar como visitante' })).toBeVisible();
    expect(localStorage.length + sessionStorage.length).toBe(0);
  });

  it('registra, inicia sesión y restaura el perfil sin usar Web Storage', async () => {
    const profile = { alias: '<b>Alias Demo</b>', email: 'ana@example.com' };
    let signedIn = false;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const path = String(input);
      if (path === '/api/auth/session') return Response.json({ profile: signedIn ? profile : null });
      if (path === '/api/auth/logout') {
        signedIn = false;
        return Response.json({ profile: null });
      }
      if (path === '/api/auth/register' || path === '/api/auth/login') {
        const payload = JSON.parse(String(init?.body));
        if (payload.email !== profile.email || payload.password !== 'clave-1234') {
          return Response.json({}, { status: 401 });
        }
        signedIn = true;
        return Response.json({ profile });
      }
      return catalogResponse(input);
    });
    const user = userEvent.setup();
    const app = open('/registro');
    const alias = await main().findByRole('textbox', { name: 'Nombre' });
    const submit = main().getByRole('button', { name: 'Crear mi perfil' });
    await user.click(submit);
    expect(alias).toHaveFocus();
    await user.type(alias, '<b>Alias Demo</b>');
    await user.type(main().getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.type(main().getByLabelText('Contraseña', { selector: 'input' }), 'clave-1234');
    await user.type(main().getByLabelText('Repetir contraseña', { selector: 'input' }), 'otra-clave');
    await user.click(submit);
    expect(main().getByLabelText('Repetir contraseña', { selector: 'input' })).toHaveAccessibleDescription(/deben coincidir/);
    await user.clear(main().getByLabelText('Repetir contraseña', { selector: 'input' }));
    await user.type(main().getByLabelText('Repetir contraseña', { selector: 'input' }), 'clave-1234');
    await user.click(submit);
    expect(await main().findByText('<b>Alias Demo</b>')).toBeVisible();
    expect(main().getByRole('heading', { name: 'Mi cuenta', level: 1 })).toBeVisible();
    expect(main().queryByRole('navigation', { name: 'Opciones de acceso' })).toBeNull();
    expect(document.querySelector('main b')).toBeNull();
    expect(screen.getByRole('link', { name: /mi cuenta/i })).toHaveAttribute('href', '/login');
    await user.click(main().getByRole('button', { name: 'Cerrar sesión' }));
    expect(screen.queryByRole('link', { name: /mi cuenta/i })).toBeNull();

    const email = main().getByLabelText('Correo electrónico');
    const password = main().getByLabelText('Contraseña', { selector: 'input' });
    await user.type(email, 'ana@example.com');
    await user.type(password, 'incorrecta');
    await user.click(main().getByRole('button', { name: 'Iniciar sesión' }));
    expect(await main().findByRole('alert')).toHaveTextContent(/son incorrectos/);
    await user.clear(password);
    await user.type(password, 'clave-1234');
    await user.click(main().getByRole('button', { name: 'Iniciar sesión' }));
    expect(await main().findByText('<b>Alias Demo</b>')).toBeVisible();
    expect(localStorage.length + sessionStorage.length).toBe(0);

    app.unmount();
    open('/registro');
    expect(await main().findByText('<b>Alias Demo</b>')).toBeVisible();
    expect(main().getByRole('heading', { name: 'Mi cuenta', level: 1 })).toBeVisible();
    expect(main().queryByRole('button', { name: 'Crear mi perfil' })).toBeNull();
  });
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from './routes';

function renderRoute(path = '/') {
  return render(<MemoryRouter initialEntries={[path]}><AppRoutes /></MemoryRouter>);
}

describe('base React y navegación', () => {
  it('renderiza inicio, pie de página y acceso al contenido principal', () => {
    renderRoute();
    expect(screen.getByRole('heading', { name: 'Legacy Vault', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido');
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#contenido');
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
    expect(document.querySelector('header a[href="/checkout"], footer a[href="/checkout"]')).toBeNull();
  });

  it('navega de inicio al catálogo, al detalle canónico y de vuelta', async () => {
    const user = userEvent.setup();
    renderRoute();
    const navigation = screen.getByRole('navigation', { name: 'Navegación principal' });
    await user.click(within(navigation).getByRole('link', { name: 'Catálogo' }));
    expect(screen.getByRole('heading', { name: 'Catálogo', level: 1 })).toHaveFocus();
    expect(document.title).toBe('Catálogo | Legacy Vault');
    await user.click(screen.getByRole('link', { name: 'Reloj de Bolsillo Suizo (c. 1912)' }));
    expect(await screen.findByRole('heading', { name: 'Reloj de Bolsillo Suizo (c. 1912)', level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/2,450.00/)).toBeInTheDocument();
    const figure = screen.getByRole('figure', { name: 'Imagen de la pieza' });
    expect(within(figure).getByRole('img', { name: /reloj de bolsillo plateado/i })).toHaveAttribute('src', '/images/producto-reloj-bolsillo.webp');
    await user.click(screen.getByRole('link', { name: 'Volver al catálogo' }));
    expect(screen.getByRole('heading', { name: 'Catálogo', level: 1 })).toBeInTheDocument();
  });

  it.each([
    ['/catalogo', 'Catálogo'],
    ['/colecciones', 'Colecciones'],
    ['/carrito', 'Carrito'],
    ['/checkout', 'Finalizar compra'],
    ['/login', 'Acceso'],
    ['/registro', 'Crear perfil'],
    ['/nosotros', 'Nosotros'],
    ['/contacto', 'Contáctanos'],
  ])('resuelve la ruta directa %s', (path, title) => {
    renderRoute(path);
    expect(screen.getByRole('heading', { name: title, level: 1 })).toHaveFocus();
    expect(document.title).toBe(`${title} | Legacy Vault`);
  });

  it('permite navegar por todos los enlaces principales', async () => {
    const user = userEvent.setup();
    renderRoute();
    for (const [link, heading] of [
      ['Carrito', 'Carrito'], ['Login', 'Acceso'],
      ['Registro', 'Crear perfil'], ['Colecciones', 'Colecciones'], ['Nosotros', 'Nosotros'], ['Contacto', 'Contáctanos'],
      ['Inicio', 'Legacy Vault'],
    ] as const) {
      await user.click(within(screen.getByRole('navigation', { name: 'Navegación principal' }))
        .getByRole('link', { name: link === 'Carrito' ? /^Carrito \d/ : link }));
      expect(screen.getByRole('heading', { name: heading, level: 1 })).toBeInTheDocument();
    }
  });

  it('abre Colecciones desde el menú móvil y filtra el catálogo por la categoría elegida', async () => {
    const user = userEvent.setup();
    renderRoute('/nosotros');
    await user.click(screen.getByRole('button', { name: 'Abrir menú de navegación' }));
    const menu = screen.getByRole('dialog', { name: 'Menú de navegación móvil' });
    await user.click(within(menu).getByRole('link', { name: 'Colecciones' }));
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('heading', { name: 'Colecciones', level: 1 })).toHaveFocus();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(main.getAllByRole('link', { name: /Relojes|Monedas|Cámaras|Antigüedades/i })).toHaveLength(4);
    await user.click(main.getByRole('link', { name: /Relojes vintage/i }));
    expect(main.getByRole('heading', { name: 'Catálogo', level: 1 })).toHaveFocus();
    expect(main.getByRole('status')).toHaveTextContent('5 resultados');
    expect(main.getByRole('combobox', { name: 'Categoría' })).toHaveValue('relojes');
  });

  it('muestra una 404 recuperable en una ruta inexistente', async () => {
    const user = userEvent.setup();
    renderRoute('/una-ruta-inexistente');
    expect(screen.getByRole('heading', { name: 'Página no encontrada', level: 1 })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Volver al inicio' }));
    expect(screen.getByRole('heading', { name: 'Legacy Vault', level: 1 })).toBeInTheDocument();
  });

  it('distingue un ID de producto desconocido de una ficha válida', async () => {
    renderRoute('/producto/no-existe');
    expect(await screen.findByRole('heading', { name: 'Pieza no encontrada', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toHaveAttribute('href', '/catalogo');
  });

  it.each(['/login', '/registro', '/checkout', '/contacto'])('respeta el alcance de los campos y las acciones en %s', async (path) => {
    renderRoute(path);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    if (path === '/registro' || path === '/login') {
      expect(await screen.findByRole('textbox', { name: 'Correo electrónico' })).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña', { selector: 'input' })).toHaveAttribute('type', 'password');
      if (path === '/registro') expect(screen.getByLabelText('Repetir contraseña', { selector: 'input' })).toHaveAttribute('type', 'password');
    } else if (path === '/contacto') {
      expect(screen.getAllByRole('textbox')).toHaveLength(3);
      expect(screen.getByRole('button', { name: /revisar consulta/i })).toBeVisible();
    } else {
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    }
    expect(document.querySelector('input[autocomplete="cc-number"]')).toBeNull();
    const restrictedAction = path === '/contacto' ? /confirmar|pagar/i : /confirmar|pagar|enviar/i;
    expect(screen.queryByRole('button', { name: restrictedAction })).not.toBeInTheDocument();
  });
});

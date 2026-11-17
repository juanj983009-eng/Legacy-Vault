import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppRoutes } from '../app/routes';
import { products } from '../test/catalogFixture';

function HistoryControls() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label="Consulta actual">{location.search}</output>
      <button onClick={() => navigate(-1)}>Atrás de prueba</button>
      <button onClick={() => navigate(1)}>Adelante de prueba</button>
    </>
  );
}

function open(path = '/catalogo') {
  const user = userEvent.setup();
  render(<MemoryRouter initialEntries={[path]}><HistoryControls /><AppRoutes /></MemoryRouter>);
  return user;
}

describe('catálogo y detalle', () => {
  it('muestra todas las tarjetas, el contador y el orden predeterminado por nombre', async () => {
    open();
    const results = await screen.findByRole('list', { name: 'Productos del catálogo' });
    expect(within(results).getAllByRole('listitem')).toHaveLength(products.length);
    expect(within(results).getAllByRole('heading').at(0)).toHaveTextContent('8 Reales');
    expect(await screen.findByText('20 resultados')).toBeVisible();
  });

  it('aplica una búsqueda por nombre con Enter y guarda el término en la URL', async () => {
    const user = open();
    await user.type(screen.getByRole('searchbox', { name: 'Buscar productos' }), 'BRUJULA{Enter}');
    expect(screen.getByText('1 resultado')).toBeVisible();
    expect(screen.getByRole('link', { name: /Brújula Cardánica/ })).toBeVisible();
    expect(screen.getByLabelText('Consulta actual')).toHaveTextContent('?buscar=BRUJULA');
  });

  it('actualiza la categoría y el orden al elegirlos y conserva el foco del selector', async () => {
    const user = open();
    const category = screen.getByRole('combobox', { name: 'Categoría' });
    await user.selectOptions(category, 'relojes');
    expect(await screen.findByText('5 resultados')).toBeVisible();
    expect(screen.getByLabelText('Consulta actual')).toHaveTextContent('?categoria=relojes');
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveFocus();

    const order = screen.getByRole('combobox', { name: 'Ordenar por' });
    await user.selectOptions(order, 'precio-desc');
    expect(screen.getByLabelText('Consulta actual')).toHaveTextContent('?categoria=relojes&orden=precio-desc');
    expect(screen.getByRole('combobox', { name: 'Ordenar por' })).toHaveFocus();
    const cards = within(screen.getByRole('list', { name: 'Productos del catálogo' })).getAllByRole('heading');
    expect(cards[0]).toHaveTextContent('Reloj de Mesa con Esfera Marfil');
  });

  it('combina categoría, precio y orden de una URL compartida', async () => {
    open('/catalogo?categoria=relojes&min=2000&max=2500&orden=precio-asc');
    const cards = within(await screen.findByRole('list', { name: 'Productos del catálogo' })).getAllByRole('heading');
    expect(cards.map((heading) => heading.textContent)).toEqual([
      'Reloj de Caza en Latón Dorado',
      'Reloj de Bolsillo Suizo (c. 1912)',
    ]);
  });

  it('limpia la consulta y restaura campos y resultados al recorrer el historial', async () => {
    const user = open('/catalogo?categoria=relojes');
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(await screen.findByText('20 resultados')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Atrás de prueba' }));
    expect(screen.getByLabelText('Categoría', { exact: true })).toHaveValue('relojes');
    expect(await screen.findByText('5 resultados')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Adelante de prueba' }));
    expect(screen.getByLabelText('Categoría', { exact: true })).toHaveValue('');
    expect(await screen.findByText('20 resultados')).toBeVisible();
  });

  it('rechaza un rango invertido sin reemplazar los filtros aplicados', async () => {
    const user = open('/catalogo?categoria=relojes');
    await user.type(screen.getByLabelText('Precio mínimo (S/)'), '3000');
    await user.type(screen.getByLabelText('Precio máximo (S/)'), '1000');
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/mínimo.*máximo/);
    expect(screen.getByLabelText('Consulta actual')).toHaveTextContent('?categoria=relojes');
    expect(await screen.findByText('5 resultados')).toBeVisible();
  });

  it('se recupera de filtros inválidos en un enlace directo', async () => {
    open('/catalogo?categoria=invalida&orden=azar&min=-5');
    expect(screen.getByRole('alert')).toHaveTextContent(/precio/i);
    expect(await screen.findByText('20 resultados')).toBeVisible();
  });

  it('muestra un estado vacío y trata el término con HTML como texto', async () => {
    const term = '<img src=x onerror=alert(1)>';
    open(`/catalogo?buscar=${encodeURIComponent(term)}`);
    expect(screen.getByRole('searchbox')).toHaveValue(term);
    expect(await screen.findByText('No encontramos piezas con estos filtros.')).toBeVisible();
    expect(screen.queryByRole('list', { name: 'Productos del catálogo' })).toBeNull();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });

  it('muestra datos canónicos, precio, disponibilidad y relacionados navegables', async () => {
    const user = open('/producto/reloj-bolsillo-suizo');
    expect(await screen.findByText(/2,450.00/)).toBeVisible();
    expect(screen.getByText('Disponible')).toBeVisible();
    expect(screen.getByText('Formato')).toBeVisible();
    const related = screen.getByRole('list', { name: 'Productos relacionados' });
    expect(within(related).getAllByRole('listitem')).toHaveLength(3);
    await user.click(within(related).getByRole('link', { name: 'Reloj de Caza en Latón Dorado' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Reloj de Caza en Latón Dorado' })).toBeVisible();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(within(heading.parentElement!).getByText('No disponible')).toBeVisible();
    expect(screen.getByRole('button', { name: /No disponible: Reloj de Caza/ })).toBeDisabled();
  });

  it('recupera un fallo de la imagen principal con texto accesible', async () => {
    open('/producto/telemetro-mecanico');
    const figure = await screen.findByRole('figure', { name: 'Imagen de la pieza' });
    fireEvent.error(within(figure).getByRole('img', { name: /cámara de telémetro/i }));
    expect(screen.getByText('Imagen no disponible.')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Recreación visual no disponible' })).toHaveAttribute('src', '/images/product-placeholder.svg');
  });

  it('permite volver al catálogo desde un ID inexistente', async () => {
    const user = open('/producto/id-inexistente');
    expect(await screen.findByRole('heading', { name: 'Pieza no encontrada' })).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Volver al catálogo' }));
    expect(await screen.findByText('20 resultados')).toBeVisible();
  });
});

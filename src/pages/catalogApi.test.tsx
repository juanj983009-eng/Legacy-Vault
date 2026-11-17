import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppRoutes } from '../app/routes';
import { CART_STORAGE_KEY } from '../services/cartStorage';
import { catalogResponse, products } from '../test/catalogFixture';

function Navigation() {
  const navigate = useNavigate();
  return <button onClick={() => void navigate('/producto/moneda-carlos-iii')}>Abrir otra pieza</button>;
}

function open(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Navigation /><AppRoutes /></MemoryRouter>);
}

function pendingResponse() {
  let resolve!: (value: Response) => void;
  const response = new Promise<Response>((complete) => { resolve = complete; });
  return { response, resolve };
}

afterEach(() => localStorage.clear());

describe('catálogo REST en las rutas', () => {
  it('muestra carga, error y reintenta mediante fetch hasta renderizar veinte piezas', async () => {
    const pending = pendingResponse();
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockReturnValueOnce(pending.response);
    open('/catalogo');
    expect(screen.getByText(/cargando piezas/i)).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith('/api/productos', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    await act(() => pending.resolve(Response.json({}, { status: 503 })));
    expect(screen.getByRole('alert')).toHaveTextContent(/no pudimos cargar/i);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('20 resultados')).toBeVisible();
    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/productos')).toHaveLength(2);
  });

  it('diferencia catálogo vacío de error y de filtros sin coincidencias', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json([]));
    open('/catalogo?buscar=otra');
    expect(await screen.findByText(/catálogo aún no tiene piezas/i)).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('mantiene el carrito y bloquea checkout durante carga y error', async () => {
    const pending = pendingResponse();
    vi.mocked(fetch).mockReturnValueOnce(pending.response);
    const saved = JSON.stringify({ version: 1, items: [{ productId: 'reloj-bolsillo-suizo', quantity: 2 }] });
    localStorage.setItem(CART_STORAGE_KEY, saved);
    open('/checkout');
    expect(screen.getByRole('link', { name: 'Carrito 2 unidades' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Revisar pedido' })).not.toBeInTheDocument();
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(saved);
    await act(() => pending.resolve(Response.json({}, { status: 503 })));
    expect(screen.queryByRole('button', { name: 'Revisar pedido' })).not.toBeInTheDocument();
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe(saved);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('button', { name: 'Revisar pedido' })).toBeVisible();
    expect(screen.getByText('Total (PEN)').nextElementSibling).toHaveTextContent('4,900.00');
  });

  it('cancela el detalle anterior y descarta su respuesta tardía', async () => {
    const pending = pendingResponse();
    let oldSignal: AbortSignal | null | undefined;
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (input === '/api/productos/reloj-bolsillo-suizo') {
        oldSignal = init?.signal;
        return pending.response;
      }
      return catalogResponse(input);
    });
    open('/producto/reloj-bolsillo-suizo');
    expect(screen.getByRole('heading', { name: 'Detalle de la pieza' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir otra pieza' }));
    expect(await screen.findByRole('heading', { level: 1, name: /8 Reales/ })).toBeVisible();
    expect(oldSignal?.aborted).toBe(true);
    await act(() => pending.resolve(Response.json(products[0])));
    expect(screen.getByRole('heading', { level: 1, name: /8 Reales/ })).toBeVisible();
  });

  it('distingue un detalle no encontrado de un fallo y permite reintentar', async () => {
    vi.mocked(fetch).mockImplementation(async (input) =>
      input === '/api/productos/pieza-ausente'
        ? Response.json({}, { status: 503 })
        : catalogResponse(input));
    open('/producto/pieza-ausente');
    expect(await screen.findByRole('alert')).toBeVisible();
    vi.mocked(fetch).mockImplementation(async (input) => catalogResponse(input));
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('heading', { name: 'Pieza no encontrada' })).toBeVisible();
  });

  it('revalida disponibilidad y usa los precios de la API en vez del almacenamiento', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(Response.json(products.map((product) =>
      product.id === 'reloj-bolsillo-suizo' ? { ...product, priceCents: 240000 } : product)));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ version: 1, items: [
      { productId: 'reloj-bolsillo-suizo', quantity: 2, priceCents: 1 },
      { productId: 'reloj-caza-laton', quantity: 1 },
    ] }));
    open('/carrito');
    expect(await screen.findByRole('alert')).toHaveTextContent(/entradas inválidas/i);
    expect((await screen.findAllByText(/4,800.00/)).length).toBeGreaterThan(0);
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY)!)).toEqual({
      version: 1, items: [{ productId: 'reloj-bolsillo-suizo', quantity: 2 }],
    });
  });
});

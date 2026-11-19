import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ProductsContext } from '../../context/productsContext';
import { products } from '../../test/catalogFixture';
import { CategoryGrid } from './CategoryGrid';

describe('Colecciones destacadas', () => {
  it('conserva los enlaces y evita que la copia decorativa reciba foco', () => {
    const { container } = render(
      <MemoryRouter>
        <ProductsContext.Provider value={{ status: 'ready', data: products, retry: vi.fn() }}>
          <CategoryGrid />
        </ProductsContext.Provider>
      </MemoryRouter>
    );
    const list = screen.getByRole('list', { name: 'Colecciones destacadas' });
    expect(within(list).getAllByRole('link')).toHaveLength(4);
    expect(screen.getByRole('link', { name: /Ver todas las colecciones/i })).toHaveAttribute('href', '/colecciones');
    const copy = container.querySelector('.collections-marquee__copy');
    expect(copy).toHaveAttribute('aria-hidden', 'true');
    expect(copy).toHaveAttribute('inert');
  });
});

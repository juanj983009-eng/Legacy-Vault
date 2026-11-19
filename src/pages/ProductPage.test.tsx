import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { AppRoutes } from '../app/routes';
import { ProductImage } from './catalog/ProductImage';
import type { ProductImage as ProductImageData } from '../types/catalog';

afterEach(() => localStorage.clear());

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Ficha de producto (ProductPage)', () => {
  it('presenta una pieza disponible con jerarquía visual completa, carrito, favoritos y relacionados', async () => {
    const user = userEvent.setup();
    open('/producto/reloj-bolsillo-suizo');

    // Jerarquía visual: título, categoría, disponibilidad y precio
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Reloj de Bolsillo Suizo (c. 1912)',
    });
    expect(heading).toBeVisible();

    const headerContainer = heading.parentElement!;
    expect(within(headerContainer).getByText('Relojes vintage')).toBeVisible();
    expect(within(headerContainer).getByText('Disponible')).toBeVisible();
    expect(within(headerContainer).getByText('Precio de adquisición')).toBeVisible();
    expect(within(headerContainer).getByText(/2,450.00/)).toBeVisible();

    // Muestra detalles existentes de forma estructurada
    expect(screen.getByRole('heading', { name: 'Detalles de la pieza' })).toBeVisible();
    expect(screen.getByText('Formato')).toBeVisible();
    expect(screen.getByText('Reloj de bolsillo')).toBeVisible();

    // Imagen única: sin miniaturas ni controles innecesarios
    expect(screen.getByRole('figure', { name: 'Imagen de la pieza' })).toBeVisible();
    expect(screen.queryByRole('list', { name: 'Miniaturas de la pieza' })).toBeNull();

    // Carrito interactivo con confirmación
    const addToCartBtn = screen.getByRole('button', { name: /Agregar al carrito: Reloj de Bolsillo Suizo/i });
    expect(addToCartBtn).toBeEnabled();
    await user.click(addToCartBtn);
    expect(addToCartBtn).toHaveTextContent('Agregado');
    expect(screen.getByRole('status', { name: 'Cambios del carrito' })).toBeVisible();

    // Favoritos interactivo con confirmación
    const favBtn = screen.getByRole('button', { name: /Guardar en favoritos: Reloj de Bolsillo Suizo/i });
    expect(favBtn).toHaveTextContent('Guardar en favoritos');
    await user.click(favBtn);
    expect(screen.getByRole('button', { name: /Quitar de favoritos: Reloj de Bolsillo Suizo/i })).toHaveTextContent(
      'En favoritos'
    );

    // Productos relacionados: aprovecha la misma categoría y excluye la pieza actual
    const relatedSection = screen.getByRole('region', { name: 'Productos relacionados' });
    expect(within(relatedSection).getByRole('heading', { name: 'Productos relacionados' })).toBeVisible();
    const relatedList = within(relatedSection).getByRole('list', { name: 'Productos relacionados' });
    const relatedItems = within(relatedList).getAllByRole('listitem');
    expect(relatedItems).toHaveLength(3);
    expect(within(relatedList).queryByText('Reloj de Bolsillo Suizo (c. 1912)')).toBeNull();

    // Navegación a un producto relacionado
    await user.click(within(relatedList).getByRole('link', { name: 'Reloj de Caza en Latón Dorado' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Reloj de Caza en Latón Dorado' })
    ).toBeVisible();
  });

  it('presenta correctamente una pieza no disponible con controles coherentes', async () => {
    const user = userEvent.setup();
    open('/producto/reloj-caza-laton');

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Reloj de Caza en Latón Dorado',
    });
    expect(heading).toBeVisible();

    const headerContainer = heading.parentElement!;
    expect(within(headerContainer).getByText('No disponible')).toBeVisible();

    // Botón de carrito deshabilitado
    const cartBtn = screen.getByRole('button', { name: /No disponible: Reloj de Caza en Latón Dorado/i });
    expect(cartBtn).toBeDisabled();

    // Favoritos sigue disponible para guardar en lista de deseos
    const favBtn = screen.getByRole('button', { name: /Guardar en favoritos: Reloj de Caza en Latón Dorado/i });
    expect(favBtn).toBeEnabled();
    await user.click(favBtn);
    expect(
      screen.getByRole('button', { name: /Quitar de favoritos: Reloj de Caza en Latón Dorado/i })
    ).toHaveTextContent('En favoritos');
  });

  it('muestra estado de pieza no encontrada con enlace al catálogo', async () => {
    const user = userEvent.setup();
    open('/producto/pieza-inexistente');

    expect(await screen.findByRole('heading', { level: 1, name: 'Pieza no encontrada' })).toBeVisible();
    expect(screen.getByText('Esta pieza no está en el catálogo.')).toBeVisible();
    const backLink = screen.getByRole('link', { name: /Volver al catálogo/i });
    expect(backLink).toBeVisible();
    await user.click(backLink);
    expect(await screen.findByRole('heading', { level: 1, name: 'Catálogo' })).toBeVisible();
  });
});

describe('Componente ProductImage (Galería y miniaturas)', () => {
  const singleImage: readonly ProductImageData[] = [
    { src: '/images/producto-reloj-bolsillo.webp', alt: 'Reloj de bolsillo suizo' },
  ];

  const multipleImages: readonly ProductImageData[] = [
    { src: '/images/producto-reloj-bolsillo.webp', alt: 'Vista frontal del reloj' },
    { src: '/images/producto-reloj-caza-laton.webp', alt: 'Detalle de la maquinaria' },
    { src: '/images/producto-reloj-pulsera-cuerda.webp', alt: 'Vista lateral y corona' },
  ];

  it('con una sola imagen, presenta la imagen limpia sin miniaturas ni controles inútiles', () => {
    render(<ProductImage images={singleImage} />);

    expect(screen.getByRole('figure', { name: 'Imagen de la pieza' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Reloj de bolsillo suizo' })).toHaveAttribute(
      'src',
      '/images/producto-reloj-bolsillo.webp'
    );
    expect(screen.getByText('Recreación visual')).toBeVisible();

    // No debe haber miniaturas ni contador
    expect(screen.queryByRole('list', { name: 'Miniaturas de la pieza' })).toBeNull();
    expect(screen.queryByText(/1 \/ 1/)).toBeNull();
  });

  it('con múltiples imágenes simuladas, muestra miniaturas interactivas y cambia la imagen activa', async () => {
    const user = userEvent.setup();
    render(<ProductImage images={multipleImages} />);

    // Imagen principal inicial
    const figure = screen.getByRole('figure', { name: 'Imagen de la pieza' });
    expect(figure).toBeVisible();
    expect(within(figure).getByRole('img', { name: 'Vista frontal del reloj' })).toBeVisible();
    expect(screen.getByText('1 / 3')).toBeVisible();

    // Miniaturas visibles como lista con botones
    const list = screen.getByRole('list', { name: 'Miniaturas de la pieza' });
    expect(list).toBeVisible();
    const buttons = within(list).getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]!).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[1]!).toHaveAttribute('aria-pressed', 'false');

    // Cambiar a la segunda imagen mediante clic
    await user.click(buttons[1]!);
    expect(buttons[1]!).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[0]!).toHaveAttribute('aria-pressed', 'false');
    expect(within(figure).getByRole('img', { name: 'Detalle de la maquinaria' })).toBeVisible();
    expect(screen.getByText('2 / 3')).toBeVisible();
  });

  it('si falla una imagen y el usuario selecciona otra, la nueva imagen se muestra correctamente', async () => {
    const user = userEvent.setup();
    const brokenImages: readonly ProductImageData[] = [
      { src: '/images/imagen-rota.webp', alt: 'Imagen con error' },
      { src: '/images/producto-reloj-bolsillo.webp', alt: 'Reloj disponible' },
    ];

    render(<ProductImage images={brokenImages} />);

    const figure = screen.getByRole('figure', { name: 'Imagen de la pieza' });
    const img1 = within(figure).getByRole('img', { name: 'Imagen con error' });

    // Simular fallo en la primera imagen
    fireEvent.error(img1);
    expect(screen.getByText('Imagen no disponible.')).toBeVisible();
    expect(screen.getByRole('img', { name: 'Recreación visual no disponible' })).toHaveAttribute(
      'src',
      '/images/product-placeholder.svg'
    );

    // Seleccionar la segunda imagen
    const buttons = screen.getAllByRole('button', { name: /imagen \d de 2/i });
    expect(buttons).toHaveLength(2);
    await user.click(buttons[1]!);

    // La nueva imagen válida debe renderizarse y el aviso de error debe desaparecer
    expect(screen.queryByText('Imagen no disponible.')).toBeNull();
    const img2 = within(figure).getByRole('img', { name: 'Reloj disponible' });
    expect(img2).toBeVisible();
    expect(img2).toHaveAttribute('src', '/images/producto-reloj-bolsillo.webp');
  });

  it('permite navegación accesible con teclado (flechas, Home, End) entre miniaturas', async () => {
    const user = userEvent.setup();
    render(<ProductImage images={multipleImages} />);

    const figure = screen.getByRole('figure', { name: 'Imagen de la pieza' });
    const buttons = screen.getAllByRole('button', { name: /imagen \d de 3/i });
    expect(buttons).toHaveLength(3);

    // Enfocar la primera miniatura
    buttons[0]!.focus();
    expect(buttons[0]!).toHaveFocus();

    // Flecha derecha: avanza a la segunda y la activa
    await user.keyboard('{ArrowRight}');
    expect(buttons[1]!).toHaveFocus();
    expect(buttons[1]!).toHaveAttribute('aria-pressed', 'true');
    expect(buttons[0]!).toHaveAttribute('aria-pressed', 'false');
    expect(within(figure).getByRole('img', { name: 'Detalle de la maquinaria' })).toBeVisible();

    // Flecha derecha: avanza a la tercera y la activa
    await user.keyboard('{ArrowRight}');
    expect(buttons[2]!).toHaveFocus();
    expect(buttons[2]!).toHaveAttribute('aria-pressed', 'true');
    expect(within(figure).getByRole('img', { name: 'Vista lateral y corona' })).toBeVisible();

    // Flecha izquierda: retrocede a la segunda
    await user.keyboard('{ArrowLeft}');
    expect(buttons[1]!).toHaveFocus();
    expect(buttons[1]!).toHaveAttribute('aria-pressed', 'true');
    expect(within(figure).getByRole('img', { name: 'Detalle de la maquinaria' })).toBeVisible();

    // Tecla Home: vuelve a la primera
    await user.keyboard('{Home}');
    expect(buttons[0]!).toHaveFocus();
    expect(buttons[0]!).toHaveAttribute('aria-pressed', 'true');
    expect(within(figure).getByRole('img', { name: 'Vista frontal del reloj' })).toBeVisible();

    // Tecla End: va a la última
    await user.keyboard('{End}');
    expect(buttons[2]!).toHaveFocus();
    expect(buttons[2]!).toHaveAttribute('aria-pressed', 'true');
    expect(within(figure).getByRole('img', { name: 'Vista lateral y corona' })).toBeVisible();
  });
});

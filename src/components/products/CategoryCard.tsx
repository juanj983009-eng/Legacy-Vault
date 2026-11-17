import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { useProducts } from '../../hooks/useProducts';
import type { Category, CategoryId } from '../../types/catalog';
import { IconArrowRight } from '../ui/Icons';
import { ProductPhoto } from './ProductPhoto';

const CATEGORY_PREVIEWS: Record<CategoryId, { productId: string; description: string }> = {
  relojes: { productId: 'reloj-bolsillo-suizo', description: 'Relojes de bolsillo y cajas ornamentadas.' },
  monedas: { productId: 'moneda-carlos-iii', description: 'Monedas de colección y relieves de época.' },
  camaras: { productId: 'telemetro-mecanico', description: 'Cámaras de telémetro y óptica mecánica.' },
  antiguedades: { productId: 'brujula-cardanica', description: 'Brújulas, astrolabios y objetos de vitrina.' },
};

export function CategoryCard({ category, expanded = false }: { category: Category; expanded?: boolean }) {
  const preview = CATEGORY_PREVIEWS[category.id];
  const catalog = useProducts();
  const products = catalog.status === 'ready' ? catalog.data : [];
  const image = products.find((product) => product.id === preview.productId)?.images[0];
  const href = `${PATHS.catalog}?categoria=${category.id}`;

  if (expanded) {
    const count = products.filter((product) => product.categoryId === category.id).length;

    return (
      <Link
        to={href}
        className="group grid min-w-0 grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 rounded-control py-4 focus-visible:outline-2 focus-visible:outline-bronce-hover sm:gap-6 sm:py-5"
      >
        <div className="aspect-square overflow-hidden rounded-control border border-contorno bg-pizarra">
          {image && <ProductPhoto image={image} className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105" />}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wider text-bronce-hover uppercase">
            {catalog.status === 'ready' ? `${count} ${count === 1 ? 'pieza' : 'piezas'}` : 'Colección'}
          </p>
          <h2 className="mt-1.5 wrap-break-word font-display text-xl font-bold leading-tight text-marfil transition-colors group-hover:text-bronce-hover sm:text-2xl">
            {category.name}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-arena">{preview.description}</p>
          <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-bronce-hover sm:text-sm">
            Ver colección <IconArrowRight className="size-4 shrink-0" />
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={href}
      className="group relative isolate grid min-h-36 w-full min-w-0 items-end overflow-hidden rounded-tarjeta border border-bronce/45 bg-pizarra transition-colors hover:border-bronce focus-visible:outline-2 focus-visible:outline-bronce xl:aspect-[1.9]"
    >
      <div className="absolute inset-0 -z-20 overflow-hidden bg-carbon">
        {image && (
          <ProductPhoto image={image} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        )}
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-carbon via-carbon/35 to-transparent" />
      <div className="space-y-1 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-1.5 sm:gap-3">
          <h3 className="min-w-0 wrap-break-word hyphens-auto font-display text-base font-bold leading-tight text-marfil transition-colors group-hover:text-bronce-hover sm:text-xl">
            {category.name}
          </h3>
          <IconArrowRight className="mt-0.5 hidden size-4 shrink-0 text-bronce-hover sm:block" />
        </div>
        <p className="hidden text-sm leading-relaxed text-arena sm:block">{preview.description}</p>
      </div>
    </Link>
  );
}

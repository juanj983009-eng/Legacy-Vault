import { useId } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import type { Product } from '../../types/catalog';
import { formatMoney } from '../../utils/money';
import { AddToCartButton } from '../cart/AddToCartButton';
import { Badge } from '../ui/Badge';
import { ProductPhoto } from './ProductPhoto';

export interface ProductCardProps {
  product: Product;
  categoryName?: string | undefined;
  featured?: boolean;
  className?: string;
}

export function ProductCard({ product, categoryName, featured = false, className = '' }: ProductCardProps) {
  const titleId = useId();
  const detailUrl = PATHS.product.replace(':id', product.id);
  const isAvailable = product.availability === 'available';

  return (
    <article
      className={`group flex flex-col rounded-tarjeta border border-contorno bg-pizarra overflow-hidden transition-all duration-200 hover:border-bronce hover:shadow-lg ${className}`}
    >
      {/* CONTENEDOR DE IMAGEN */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-carbon">
        <ProductPhoto
          image={product.images[0]}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {categoryName && !featured && (
            <Badge variant="neutral" size="sm">
              {categoryName}
            </Badge>
          )}
          {!isAvailable && (
            <Badge variant="unavailable" size="sm">
              No disponible
            </Badge>
          )}
        </div>
      </div>

      {/* CONTENIDO Y ACCIONES */}
      <div className={`flex flex-1 flex-col justify-between ${featured ? 'p-3 sm:p-4' : 'p-4'}`}>
        <div>
          <h3 id={titleId} className="min-h-10 font-display text-base font-bold leading-snug text-marfil transition-colors group-hover:text-bronce">
            <Link to={detailUrl} className="focus-visible:outline-2 focus-visible:outline-bronce">
              {product.name}
            </Link>
          </h3>
          {!featured && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-arena/80">{product.description}</p>
          )}
        </div>

        <div className="mt-3 border-t border-contorno/60 pt-3">
          <div className="mb-3 font-display text-lg font-bold tabular-nums text-bronce-hover">
            {formatMoney(product.priceCents)}
          </div>

          <div className={`grid gap-2 ${featured ? 'sm:grid-cols-2' : 'grid-cols-2'}`}>
            <Link
              to={detailUrl}
              aria-describedby={titleId}
              className="inline-flex min-h-11 items-center justify-center rounded-control border border-arena/50 px-3 text-xs font-semibold text-marfil transition-colors hover:border-bronce hover:text-bronce focus-visible:outline-2 focus-visible:outline-bronce"
            >
              Ver detalles
            </Link>
            <AddToCartButton product={product} compact />
          </div>
        </div>
      </div>
    </article>
  );
}

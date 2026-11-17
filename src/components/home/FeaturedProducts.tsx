import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { categories, featuredProductIds } from '../../data/catalog';
import { useProducts } from '../../hooks/useProducts';
import { CatalogStatus } from '../products/CatalogStatus';
import type { Product } from '../../types/catalog';
import { ProductCard } from '../products/ProductCard';
import { IconArrowRight } from '../ui/Icons';

export function FeaturedProducts() {
  const catalog = useProducts();
  const products = catalog.status === 'ready' ? catalog.data : [];
  const featuredList = featuredProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => product !== undefined);

  const getCategoryName = (categoryId: string) =>
    categories.find((cat) => cat.id === categoryId)?.name;

  return (
    <section className="border-b border-contorno bg-pizarra/40 py-7 sm:py-9">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ENCABEZADO */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-marfil sm:text-3xl">
              Piezas destacadas
            </h2>
          </div>
          <Link
            to={PATHS.catalog}
            className="group inline-flex min-h-11 items-center gap-1.5 self-start md:self-auto font-body text-sm font-semibold text-bronce transition-colors hover:text-bronce-hover focus-visible:outline-2 focus-visible:outline-bronce"
          >
            <span>Ver catálogo completo</span>
            <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* RETÍCULA RESPONSIVE DE PIEZAS DESTACADAS */}
        {catalog.status !== 'ready' ? <CatalogStatus status={catalog.status} retry={catalog.retry} /> : !featuredList.length ? (
          <CatalogStatus status="empty" />
        ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featuredList.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              featured
              categoryName={getCategoryName(product.categoryId)}
            />
          ))}
        </div>)}
      </div>
    </section>
  );
}

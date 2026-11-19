import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { PATHS } from '../app/paths';
import { AddToCartButton } from '../components/cart/AddToCartButton';
import { Badge } from '../components/ui/Badge';
import { FavoriteButton } from '../components/products/FavoriteButton';
import { RecentProductsSection } from '../components/products/RecentProductsSection';
import { categories } from '../data/catalog';
import { CatalogStatus } from '../components/products/CatalogStatus';
import { useProduct } from '../hooks/useCatalogRequest';
import { useProducts } from '../hooks/useProducts';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { recordRecentProduct } from '../services/recentProductsStorage';
import { formatMoney } from '../utils/money';
import { CatalogProductGrid } from './catalog/CatalogProductGrid';
import { ProductImage } from './catalog/ProductImage';

export function ProductPage() {
  const { id } = useParams<'id'>();
  const detail = useProduct(id);
  const catalog = useProducts();
  const product = detail.status === 'ready' ? detail.data : null;
  const title = product?.name ?? (detail.status === 'ready' ? 'Pieza no encontrada' : 'Detalle de la pieza');
  const heading = usePageMetadata(title);

  useEffect(() => {
    if (product) {
      recordRecentProduct(product.id);
    }
  }, [product]);
  const back = (
    <Link
      className="inline-flex min-h-11 items-center text-sm font-medium text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce"
      to={PATHS.catalog}
    >
      <span aria-hidden="true">← </span>Volver al catálogo
    </Link>
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 ref={heading} tabIndex={-1} className="mb-4 font-display text-3xl font-bold text-marfil focus:outline-none">{title}</h1>
        {detail.status !== 'ready' ? (
          <CatalogStatus status={detail.status} retry={detail.retry} />
        ) : (
          <p className="mx-auto max-w-md py-8 text-center text-arena">Esta pieza no está en el catálogo.</p>
        )}
        <div className="mt-4">{back}</div>
      </div>
    );
  }

  const category = categories.find(({ id }) => id === product.categoryId);
  const related = (catalog.status === 'ready' ? catalog.data : [])
    .filter(({ id, categoryId }) => id !== product.id && categoryId === product.categoryId)
    .slice(0, 3);
  const available = product.availability === 'available';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* MIGA DE PAN */}
      <nav aria-label="Miga de pan" className="mb-5 text-xs text-arena/80">
        <ol className="flex items-center gap-1.5 flex-wrap">
          <li>
            <Link to={PATHS.home} className="hover:text-bronce transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true" className="text-arena/40">/</li>
          <li>
            <Link to={PATHS.catalog} className="hover:text-bronce transition-colors">
              Catálogo
            </Link>
          </li>
          {category && (
            <>
              <li aria-hidden="true" className="text-arena/40">/</li>
              <li>
                <Link
                  to={`${PATHS.catalog}?categoria=${category.id}`}
                  className="hover:text-bronce transition-colors"
                >
                  {category.name}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden="true" className="text-arena/40">/</li>
          <li aria-current="page" className="text-marfil font-medium line-clamp-1">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* GRID PRINCIPAL: 2 COLUMNAS EN DESKTOP */}
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-12 lg:gap-12">
        {/* COLUMNA IZQUIERDA: IMAGEN / GALERÍA */}
        <div className="min-w-0 lg:col-span-7">
          <ProductImage key={product.id} images={product.images} />
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN Y ACCIONES */}
        <div className="min-w-0 space-y-6 lg:col-span-5">
          <div className="space-y-3 border-b border-contorno/60 pb-5">
            <div className="flex flex-wrap items-center gap-2">
              {category && (
                <Link
                  to={`${PATHS.catalog}?categoria=${category.id}`}
                  className="inline-flex focus-visible:outline-2 focus-visible:outline-bronce rounded-control"
                >
                  <Badge variant="neutral">{category.name}</Badge>
                </Link>
              )}
              <Badge variant={available ? 'bronze' : 'unavailable'}>
                {available ? 'Disponible' : 'No disponible'}
              </Badge>
            </div>

            <h1
              ref={heading}
              tabIndex={-1}
              className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-marfil focus:outline-none leading-tight"
            >
              {product.name}
            </h1>

            {/* PRECIO */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-arena/70 block font-medium">
                Precio de adquisición
              </span>
              <strong className="mt-1 block font-display text-3xl sm:text-4xl font-bold tabular-nums text-bronce-hover">
                {formatMoney(product.priceCents)}
              </strong>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div className="space-y-2">
            <h2 className="sr-only">Descripción de la pieza</h2>
            <p className="max-w-prose text-sm sm:text-base leading-relaxed text-arena/90 font-body">
              {product.description}
            </p>
          </div>

          {/* CARACTERÍSTICAS / DETALLES DE LA PIEZA */}
          {product.features.length > 0 && (
            <section aria-labelledby="product-features" className="rounded-tarjeta border border-contorno/70 bg-pizarra/60 p-4 sm:p-5">
              <h2 id="product-features" className="font-display text-sm uppercase tracking-wider font-semibold text-bronce mb-3">
                Detalles de la pieza
              </h2>
              <dl className="divide-y divide-contorno/40 text-xs sm:text-sm">
                {product.features.map((feature) => (
                  <div key={feature.label} className="grid grid-cols-[minmax(5rem,1fr)_2fr] py-2.5 first:pt-0 last:pb-0 gap-3">
                    <dt className="font-medium text-marfil">{feature.label}</dt>
                    <dd className="text-arena/85">
                      {feature.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* BLOQUE DE ACCIONES */}
          <div className="space-y-3 rounded-tarjeta border border-contorno bg-pizarra p-4 sm:p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              {catalog.status === 'ready' ? (
                <>
                  <AddToCartButton key={product.id} product={product} />
                  <FavoriteButton productId={product.id} productName={product.name} showLabel />
                </>
              ) : (
                <CatalogStatus status={catalog.status} retry={catalog.retry} />
              )}
            </div>
            <div className="pt-2 border-t border-contorno/50 flex items-center justify-between">
              {back}
              {category && (
                <Link
                  to={`${PATHS.catalog}?categoria=${category.id}`}
                  className="text-xs text-arena/70 hover:text-bronce transition-colors"
                >
                  Ver más en {category.name} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE PRODUCTOS RELACIONADOS */}
      {related.length > 0 && (
        <section aria-labelledby="product-related" className="mt-14 space-y-6 border-t border-contorno pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-bronce">
                Colección sugerida
              </span>
              <h2 id="product-related" className="mt-1 font-display text-2xl sm:text-3xl font-bold text-marfil">
                Productos relacionados
              </h2>
            </div>
            {category && (
              <Link
                to={`${PATHS.catalog}?categoria=${category.id}`}
                className="text-sm font-medium text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce"
              >
                Explorar toda la categoría {category.name} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
          <CatalogProductGrid items={related} label="Productos relacionados" />
        </section>
      )}

      {/* SECCIÓN DE PRODUCTOS VISTOS RECIENTEMENTE */}
      <RecentProductsSection
        excludeId={product.id}
        className="mt-14 border-t border-contorno pt-10"
      />
    </div>
  );
}

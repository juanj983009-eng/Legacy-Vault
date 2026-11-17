import { Link, useParams } from 'react-router';
import { PATHS } from '../app/paths';
import { AddToCartButton } from '../components/cart/AddToCartButton';
import { Badge } from '../components/ui/Badge';
import { categories } from '../data/catalog';
import { CatalogStatus } from '../components/products/CatalogStatus';
import { useProduct } from '../hooks/useCatalogRequest';
import { useProducts } from '../hooks/useProducts';
import { usePageMetadata } from '../hooks/usePageMetadata';
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
      <nav aria-label="Miga de pan" className="mb-4 text-xs text-arena/80">
        <ol className="flex items-center gap-1.5">
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
          <li aria-hidden="true" className="text-arena/40">/</li>
          <li aria-current="page" className="text-marfil font-medium line-clamp-1">
            {product.name}
          </li>
        </ol>
      </nav>
      <div className="grid min-w-0 items-start gap-x-8 gap-y-4 lg:grid-cols-[minmax(0,1.13fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
        <div className="min-w-0 space-y-3 lg:col-start-2">
          <div className="flex flex-wrap items-center gap-2">
            {category && <Badge variant="neutral">{category.name}</Badge>}
            <Badge variant={available ? 'bronze' : 'unavailable'}>
              {available ? 'Disponible' : 'No disponible'}
            </Badge>
          </div>

          <h1 ref={heading} tabIndex={-1} className="font-display text-3xl font-bold tracking-tight text-marfil focus:outline-none lg:text-4xl">
            {product.name}
          </h1>
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <ProductImage key={product.id} image={product.images[0]} />
        </div>

        <div className="min-w-0 space-y-5 lg:col-start-2">

          <div className="border-l-2 border-bronce/75 pl-4">
            <span className="text-xs uppercase tracking-wider text-arena/70 block mb-0.5">
              Precio
            </span>
            <strong className="mt-0.5 block font-display text-3xl font-bold tabular-nums text-bronce-hover">
              {formatMoney(product.priceCents)}
            </strong>
          </div>

          <p className="max-w-prose text-base leading-relaxed text-arena/90">{product.description}</p>

          {product.features.length > 0 && (
            <section aria-labelledby="product-features" className="border-t border-contorno/60 pt-5">
              <h2 id="product-features" className="font-display text-base font-bold text-marfil mb-3">
                Detalles de la pieza
              </h2>
              <dl className="divide-y divide-contorno/40 rounded-control border border-contorno/60 bg-carbon/50 p-4 text-xs sm:text-sm">
                {product.features.map((feature) => (
                  <div key={feature.label} className="grid grid-cols-[minmax(4rem,1fr)_2fr] py-2.5 first:pt-0 last:pb-0 gap-2">
                    <dt className="font-medium text-marfil">{feature.label}</dt>
                    <dd className="text-arena/80">
                      {feature.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {catalog.status === 'ready' ? <AddToCartButton key={product.id} product={product} /> : (
              <CatalogStatus status={catalog.status} retry={catalog.retry} />
            )}
            {back}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="product-related" className="mt-8 space-y-4 border-t border-contorno pt-6">
          <div>
            <h2 id="product-related" className="mt-1 font-display text-2xl font-bold text-marfil">
              Productos relacionados
            </h2>
          </div>
          <CatalogProductGrid items={related} label="Productos relacionados" />
        </section>
      )}
    </div>
  );
}

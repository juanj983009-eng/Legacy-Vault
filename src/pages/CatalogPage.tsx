import { useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { PATHS } from '../app/paths';
import { PageFrame } from '../components/ui/PageFrame';
import { CatalogStatus } from '../components/products/CatalogStatus';
import { useProducts } from '../hooks/useProducts';
import { parseCatalogQuery, selectProducts } from '../utils/catalogQuery';
import { CatalogFilters, type CatalogSelect } from './catalog/CatalogFilters';
import { CatalogProductGrid } from './catalog/CatalogProductGrid';

export function CatalogPage() {
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const form = useRef<HTMLFormElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const nextFocus = useRef<CatalogSelect | 'results'>(null);
  const query = parseCatalogQuery(params);
  const catalog = useProducts();
  const results = catalog.status === 'ready' ? selectProducts(catalog.data, query) : [];

  useEffect(() => {
    const target = nextFocus.current;
    nextFocus.current = null;
    if (target === 'results') status.current?.focus();
    else if (target) {
      const select = form.current?.elements.namedItem(target);
      if (select instanceof HTMLSelectElement) select.focus({ preventScroll: true });
    }
  }, [location.key]);

  function applyFilters(next: URLSearchParams, keepFocus?: CatalogSelect) {
    nextFocus.current = keepFocus ?? 'results';
    setParams(next, { replace: next.toString() === params.toString(), preventScrollReset: true });
  }

  return (
    <PageFrame title="Catálogo" banner={{ description: 'Explora relojes vintage, monedas históricas, cámaras antiguas y otros objetos de colección.' }}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <nav aria-label="Miga de pan" className="text-xs text-arena/80">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link to={PATHS.home} className="hover:text-bronce transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true" className="text-arena/40">/</li>
            <li aria-current="page" className="text-marfil font-medium">
              Catálogo General
            </li>
          </ol>
        </nav>
        {catalog.status === 'ready' && catalog.data.length > 0 && (
          <p ref={status} role="status" tabIndex={-1} className="scroll-mt-24 text-sm tabular-nums text-arena">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
          </p>
        )}
      </div>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <CatalogFilters key={location.key} query={query} formRef={form} onApply={applyFilters} />
        <section aria-labelledby="catalog-results" className="min-w-0 space-y-4">
          <h2 id="catalog-results" className="sr-only">Resultados del catálogo</h2>
          {catalog.status !== 'ready' ? (
            <CatalogStatus status={catalog.status} retry={catalog.retry} />
          ) : catalog.data.length === 0 ? (
            <CatalogStatus status="empty" />
          ) : results.length ? (
            <CatalogProductGrid items={results} label="Productos del catálogo" />
          ) : (
            <div className="rounded-tarjeta border border-contorno bg-pizarra p-6">
              <p>No encontramos piezas con estos filtros.</p>
              <p className="mt-2 text-sm text-arena">Prueba otra búsqueda o limpia los filtros.</p>
            </div>
          )}
        </section>
      </div>
    </PageFrame>
  );
}

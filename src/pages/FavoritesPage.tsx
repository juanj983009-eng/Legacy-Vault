import { useMemo } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { EmptyFavoritesState } from '../components/favorites/EmptyFavoritesState';
import { CatalogStatus } from '../components/products/CatalogStatus';
import { Button } from '../components/ui/Button';
import { IconInfo } from '../components/ui/Icons';
import { PageFrame } from '../components/ui/PageFrame';
import { useFavorites } from '../hooks/useFavorites';
import { useProducts } from '../hooks/useProducts';
import { CatalogProductGrid } from './catalog/CatalogProductGrid';

export function FavoritesPage() {
  const { favorites, clearFavorites, persistenceWarning } = useFavorites();
  const catalog = useProducts();

  const favoriteProducts = useMemo(() => {
    if (catalog.status !== 'ready') return [];
    const set = new Set(favorites);
    return catalog.data.filter((product) => set.has(product.id));
  }, [catalog, favorites]);

  const clearButton = (
    <Button
      variant="outline"
      size="sm"
      onClick={clearFavorites}
      className="text-xs text-arena/80 hover:text-marfil hover:border-error"
    >
      Vaciar favoritos
    </Button>
  );

  return (
    <PageFrame
      title="Favoritos"
      banner={{
        description: 'Tus piezas guardadas para consultar en cualquier momento.',
      }}
    >
      <nav aria-label="Miga de pan" className="mb-2 text-xs text-arena/70">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to={PATHS.home} className="hover:text-bronce transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true" className="text-arena/40">
            /
          </li>
          <li aria-current="page" className="text-marfil font-medium">
            Favoritos
          </li>
        </ol>
      </nav>

      {persistenceWarning && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-control border border-bronce/60 bg-pizarra/90 p-4 text-xs sm:text-sm text-arena shadow-sm"
        >
          <IconInfo className="mt-0.5 h-5 w-5 shrink-0 text-bronce" />
          <p className="leading-relaxed">{persistenceWarning}</p>
        </div>
      )}

      {favorites.length === 0 ? (
        <EmptyFavoritesState />
      ) : catalog.status === 'loading' ? (
        <CatalogStatus status="loading" />
      ) : catalog.status === 'error' ? (
        <div className="space-y-4 py-4">
          <CatalogStatus status="error" retry={catalog.retry} />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-contorno pt-4">
            <p className="text-xs text-arena/80">
              Tienes {favorites.length} {favorites.length === 1 ? 'pieza guardada' : 'piezas guardadas'} en este navegador.
            </p>
            {clearButton}
          </div>
        </div>
      ) : catalog.data.length === 0 ? (
        <div className="space-y-4 py-4">
          <CatalogStatus status="empty" />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-contorno pt-4">
            <p className="text-xs text-arena/80">
              Tienes {favorites.length} {favorites.length === 1 ? 'pieza guardada' : 'piezas guardadas'} en este navegador.
            </p>
            {clearButton}
          </div>
        </div>
      ) : favoriteProducts.length === 0 ? (
        <div className="space-y-4 py-4">
          <div className="rounded-tarjeta border border-contorno bg-pizarra p-6">
            <p className="font-medium text-marfil">Las piezas guardadas no están disponibles en este momento.</p>
            <p className="mt-2 text-sm text-arena">El catálogo se actualizará cuando vuelvan a estar disponibles.</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-contorno pt-4">
            <Link
              to={PATHS.catalog}
              className="inline-flex min-h-11 items-center text-sm font-medium text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <span aria-hidden="true">← </span>Explorar catálogo
            </Link>
            {clearButton}
          </div>
        </div>
      ) : (
        <div className="space-y-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-contorno pb-4">
            <h2 className="font-display text-xl font-bold text-marfil">
              Piezas guardadas ({favoriteProducts.length})
            </h2>
            {clearButton}
          </div>

          <CatalogProductGrid items={favoriteProducts} label="Piezas guardadas en favoritos" />

          <div className="border-t border-contorno pt-4">
            <Link
              to={PATHS.catalog}
              className="inline-flex min-h-11 items-center text-sm font-medium text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <span aria-hidden="true">← </span>Explorar más piezas en el catálogo
            </Link>
          </div>
        </div>
      )}
    </PageFrame>
  );
}

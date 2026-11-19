import { useEffect, useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import {
  loadRecentProductIds,
  RECENT_UPDATED_EVENT,
} from '../../services/recentProductsStorage';
import type { Product } from '../../types/catalog';
import { CatalogProductGrid } from '../../pages/catalog/CatalogProductGrid';

export interface RecentProductsSectionProps {
  excludeId?: string;
  title?: string;
  className?: string;
}

export function RecentProductsSection({
  excludeId,
  title = 'Vistos recientemente',
  className = '',
}: RecentProductsSectionProps) {
  const catalog = useProducts();
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecentProductIds().items);

  useEffect(() => {
    const update = () => {
      setRecentIds(loadRecentProductIds().items);
    };
    update();

    window.addEventListener(RECENT_UPDATED_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(RECENT_UPDATED_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, [excludeId]);

  if (catalog.status !== 'ready' || !catalog.data || catalog.data.length === 0 || recentIds.length === 0) {
    return null;
  }

  // Mapear los productos disponibles en el catálogo conservando el orden de consulta reciente
  const catalogMap = new Map(catalog.data.map((p) => [p.id, p]));
  const products: Product[] = [];

  for (const id of recentIds) {
    if (excludeId && id === excludeId) continue;
    const prod = catalogMap.get(id);
    if (prod) {
      products.push(prod);
    }
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="recent-products-heading" className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-bronce">
            Historial de consulta
          </span>
          <h2
            id="recent-products-heading"
            className="mt-1 font-display text-2xl sm:text-3xl font-bold text-marfil"
          >
            {title}
          </h2>
        </div>
      </div>
      <CatalogProductGrid items={products} label={title} />
    </section>
  );
}

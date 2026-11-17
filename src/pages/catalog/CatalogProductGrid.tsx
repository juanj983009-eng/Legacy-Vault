import { ProductCard } from '../../components/products/ProductCard';
import { categories } from '../../data/catalog';
import type { Product } from '../../types/catalog';

export function CatalogProductGrid({ items, label }: { items: readonly Product[]; label: string }) {
  return (
    <ul aria-label={label} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((product) => (
        <li key={product.id} className="min-w-0">
          <ProductCard
            product={product}
            categoryName={categories.find(({ id }) => id === product.categoryId)?.name}
            className="h-full min-w-0"
          />
        </li>
      ))}
    </ul>
  );
}

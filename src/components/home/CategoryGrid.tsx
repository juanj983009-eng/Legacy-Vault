import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { categories } from '../../data/catalog';
import { CategoryCard } from '../products/CategoryCard';

export function CategoryGrid() {
  return (
    <section id="colecciones" aria-labelledby="collection-heading" className="scroll-mt-20 border-b border-contorno bg-carbon py-7 sm:py-9">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ENCABEZADO DE SECCIÓN */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 id="collection-heading" className="font-display text-2xl font-bold tracking-tight text-marfil sm:text-3xl">
            Colecciones destacadas
          </h2>
          <Link to={PATHS.collections} className="inline-flex min-h-11 items-center text-sm font-semibold text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce">
            Ver todas las colecciones <span aria-hidden="true" className="ml-1.5">→</span>
          </Link>
        </div>

        {/* RETÍCULA RESPONSIVE DE CATEGORÍAS */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </section>
  );
}

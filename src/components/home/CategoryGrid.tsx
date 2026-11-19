import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { categories } from '../../data/catalog';
import { CategoryCard } from '../products/CategoryCard';

export function CategoryGrid() {
  return (
    <section id="colecciones" aria-labelledby="collection-heading" className="scroll-mt-20 border-b border-contorno bg-carbon py-7 sm:py-9">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 id="collection-heading" className="font-display text-2xl font-bold tracking-tight text-marfil sm:text-3xl">
            Colecciones destacadas
          </h2>
          <Link to={PATHS.collections} className="inline-flex min-h-11 items-center text-sm font-semibold text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce">
            Ver todas las colecciones <span aria-hidden="true" className="ml-1.5">→</span>
          </Link>
        </div>

        <div className="collections-marquee relative left-1/2 w-screen -translate-x-1/2">
          <div className="collections-marquee__track">
            <ul className="collections-marquee__group" aria-label="Colecciones destacadas">
              {categories.map((category) => (
                <li key={category.id} className="collections-marquee__item">
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>
            <ul className="collections-marquee__group collections-marquee__copy" aria-hidden="true" inert>
              {categories.map((category) => (
                <li key={category.id} className="collections-marquee__item">
                  <CategoryCard category={category} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

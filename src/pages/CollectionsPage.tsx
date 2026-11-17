import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { CategoryCard } from '../components/products/CategoryCard';
import { IconArrowRight } from '../components/ui/Icons';
import { categories } from '../data/catalog';
import { usePageMetadata } from '../hooks/usePageMetadata';

export function CollectionsPage() {
  const heading = usePageMetadata('Colecciones');

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-bronce/30 bg-carbon">
        <img
          src="/images/editorial-vitrina-colecciones.webp"
          alt=""
          width={1440}
          height={480}
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-right md:object-[center_55%]"
        />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-carbon via-carbon/85 to-carbon/35 md:via-carbon/50 md:to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <h1 ref={heading} tabIndex={-1} className="font-display text-4xl font-bold tracking-tight text-marfil focus:outline-none sm:text-6xl">
            Colecciones
          </h1>
          <div aria-hidden="true" className="mt-4 h-px w-12 bg-bronce-hover" />
          <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-marfil sm:text-base">
            De la relojería a la fotografía, recorre la vitrina por los objetos que te interesan.
          </p>
          <Link
            to={PATHS.catalog}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-control border border-bronce/70 bg-carbon/80 px-4 text-sm font-semibold text-marfil transition-colors hover:border-bronce-hover hover:text-bronce-hover focus-visible:outline-2 focus-visible:outline-bronce-hover"
          >
            Ver catálogo completo <IconArrowRight className="size-4 text-bronce-hover" />
          </Link>
        </div>
      </section>
      <ul aria-label="Colecciones disponibles" className="mx-auto grid max-w-7xl gap-x-8 px-4 py-6 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-10">
        {categories.map((category) => (
          <li key={category.id} className="min-w-0 border-b border-contorno">
            <CategoryCard category={category} expanded />
          </li>
        ))}
      </ul>
    </>
  );
}


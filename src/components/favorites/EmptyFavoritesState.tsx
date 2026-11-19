import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { IconArrowRight, IconHeart } from '../ui/Icons';

export function EmptyFavoritesState() {
  return (
    <section aria-labelledby="empty-favorites-title" className="mx-auto my-8 max-w-2xl text-center sm:my-12">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-bronce/30 bg-pizarra text-bronce shadow-inner">
        <IconHeart className="h-10 w-10" />
      </div>
      <div className="flex min-w-0 flex-col items-center px-4">
        <h2
          id="empty-favorites-title"
          className="font-display text-2xl font-bold tracking-tight text-marfil sm:text-3xl"
        >
          No tienes piezas guardadas en favoritos.
        </h2>
        <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-arena sm:text-base">
          Explora la colección de piezas históricas y guarda tus preferidas para revisarlas o adquirirlas más adelante.
        </p>
        <Link
          to={PATHS.catalog}
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-bronce px-5 py-2 text-sm font-semibold text-carbon hover:bg-bronce-hover focus-visible:outline-2 focus-visible:outline-bronce"
        >
          Explorar catálogo <IconArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

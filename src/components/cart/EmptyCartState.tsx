import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { IconArrowRight } from '../ui/Icons';

export function EmptyCartState() {
  return (
    <section aria-labelledby="empty-cart-title" className="mx-auto my-4 max-w-3xl text-center sm:my-6">
      <div className="relative mx-auto aspect-[3/2] w-full max-w-lg overflow-hidden motion-safe:animate-[empty-cart-reveal_700ms_ease-out_both]">
        <img src="/images/editorial-carrito-vacio-fundido.webp" alt="" width={1440} height={960}
          className="absolute inset-0 h-full w-full object-contain" style={{ maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 48%, transparent 100%)' }} />
      </div>
      <div className="flex min-w-0 flex-col items-center px-4 pt-3 pb-6 sm:pt-5">
        <h2 id="empty-cart-title" className="font-display text-2xl leading-tight font-bold tracking-tight text-marfil sm:text-3xl">Tu carrito está vacío.</h2>
        <p className="mt-2.5 max-w-[42ch] text-sm leading-relaxed text-arena sm:text-base">
          Explora la colección y guarda aquí las piezas que quieras llevar.
        </p>
        <Link to={PATHS.catalog} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-bronce px-5 py-2 text-sm font-semibold text-carbon hover:bg-bronce-hover">
          Explorar catálogo <IconArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}

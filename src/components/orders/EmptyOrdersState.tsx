import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { IconArrowRight, IconHistory } from '../ui/Icons';

export function EmptyOrdersState() {
  return (
    <section aria-labelledby="empty-orders-title" className="mx-auto my-8 max-w-2xl text-center sm:my-12">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-bronce/30 bg-pizarra text-bronce shadow-inner">
        <IconHistory className="h-10 w-10" />
      </div>
      <div className="flex min-w-0 flex-col items-center px-4">
        <h2
          id="empty-orders-title"
          className="font-display text-2xl font-bold tracking-tight text-marfil sm:text-3xl"
        >
          No tienes pedidos registrados.
        </h2>
        <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-arena sm:text-base">
          Los pedidos simulados que confirmes durante la demostración se guardarán en este navegador para que puedas revisar sus piezas, cantidades y totales.
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

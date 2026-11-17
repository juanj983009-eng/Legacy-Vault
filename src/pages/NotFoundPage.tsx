import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { IconSearch } from '../components/ui/Icons';
import { PageFrame } from '../components/ui/PageFrame';

export function NotFoundPage() {
  return (
    <PageFrame title="Página no encontrada" visuallyHiddenTitle>
      <div className="relative flex min-h-[60vh] items-center justify-center py-12 sm:py-16 text-center">
        {/* FONDO SUTIL */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,137,63,0.15),transparent_70%)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-xl px-4">
          {/* EMBLEMA 404 DE ARCHIVO */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-bronce/60 bg-pizarra text-bronce shadow-inner">
            <span className="font-display text-3xl font-bold tracking-wider">404</span>
          </div>

          <span className="mb-2 block font-body text-xs font-semibold uppercase tracking-widest text-arena/70">
            Registro No Localizado
          </span>

          {/* TÍTULO APROBADO */}
          <h2 className="font-display text-2xl font-bold leading-tight text-marfil sm:text-4xl mb-4">
            Esta pieza no está en nuestra colección.
          </h2>

          <p className="mx-auto mb-8 max-w-md font-body text-sm sm:text-base leading-relaxed text-arena text-pretty">
            No encontramos la página solicitada. Puedes volver al inicio o explorar las piezas disponibles en el catálogo.
          </p>

          {/* ACCIONES DE RECUPERACIÓN */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={PATHS.home}
              className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-control bg-bronce px-8 py-3 font-body text-sm font-bold text-carbon transition-colors hover:bg-bronce-hover focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <span>Volver al inicio</span>
            </Link>

            <Link
              to={PATHS.catalog}
              className="inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-control border border-contorno px-8 py-3 font-body text-sm font-semibold text-marfil transition-colors hover:border-bronce hover:text-bronce focus-visible:outline-2 focus-visible:outline-bronce"
            >
              <IconSearch className="h-4 w-4" />
              <span>Explorar catálogo</span>
            </Link>
          </div>

          {/* SUGERENCIAS RÁPIDAS DE COLECCIONES */}
          <div className="mt-12 border-t border-contorno/60 pt-8 text-xs font-body text-arena/70">
            <p className="mb-3 font-medium text-marfil/90">Colecciones sugeridas para continuar la visita:</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-arena/80">
              <Link to={`${PATHS.catalog}?categoria=relojes`} className="hover:text-bronce underline underline-offset-4">
                Relojes vintage
              </Link>
              <span aria-hidden="true">•</span>
              <Link to={`${PATHS.catalog}?categoria=monedas`} className="hover:text-bronce underline underline-offset-4">
                Monedas históricas
              </Link>
              <span aria-hidden="true">•</span>
              <Link to={`${PATHS.catalog}?categoria=camaras`} className="hover:text-bronce underline underline-offset-4">
                Cámaras antiguas
              </Link>
              <span aria-hidden="true">•</span>
              <Link to={`${PATHS.catalog}?categoria=antiguedades`} className="hover:text-bronce underline underline-offset-4">
                Antigüedades
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

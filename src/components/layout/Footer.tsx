import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { categories } from '../../data/catalog';
import { BrandLogo } from '../ui/BrandLogo';
import { IconArrowRight } from '../ui/Icons';

const storeLinks = [
  { to: PATHS.about, label: 'Nosotros' },
  { to: PATHS.contact, label: 'Contacto' },
  { to: PATHS.orders, label: 'Mis pedidos' },
];

const footerLinkClass = 'inline-flex min-h-10 items-center rounded-sm py-1.5 text-sm leading-snug text-arena transition-colors hover:text-bronce-hover';

export function Footer() {
  return (
    <footer className="border-t border-bronce/35 bg-carbon bg-[radial-gradient(ellipse_at_top_left,var(--color-madera),transparent_58%)] text-marfil">
      <div className="bg-carbon/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-7 py-8 sm:py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <Link to={PATHS.home} aria-label="Legacy Vault, inicio" className="inline-flex rounded-control">
                <BrandLogo />
              </Link>
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-arena">
                Antigüedades, instrumentos de precisión y piezas de colección.
              </p>
              <Link to={PATHS.catalog} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-control border border-bronce/55 px-3.5 text-sm font-semibold text-bronce-hover transition-colors hover:bg-bronce hover:text-carbon">
                Explorar catálogo <IconArrowRight className="size-4 shrink-0" />
              </Link>
            </div>

            <nav aria-label="Enlaces del pie de página" className="grid min-w-0 grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-x-4 border-t border-contorno pt-5 sm:gap-x-8 md:border-t-0 md:border-l md:pt-1 md:pl-6 lg:pl-9">
              <div className="min-w-0">
                <h2 className="mb-2 font-display text-lg font-bold leading-tight text-marfil">Colecciones</h2>
                <ul>
                  {categories.map(({ id, name }) => (
                    <li key={id}>
                      <Link to={`${PATHS.catalog}?categoria=${id}`} className={footerLinkClass}>
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0">
                <h2 className="mb-2 font-display text-lg font-bold leading-tight text-marfil">La tienda</h2>
                <ul>
                  {storeLinks.map(({ to, label }) => (
                    <li key={to}>
                      <Link to={to} className={footerLinkClass}>{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>

          <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-contorno py-4 text-xs leading-relaxed text-arena/80">
            <p>© 2026 Legacy Vault</p>
            <p>Precios en soles peruanos (PEN)</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

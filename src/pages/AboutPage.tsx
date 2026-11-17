import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { IconArrowRight } from '../components/ui/Icons';
import { PageFrame } from '../components/ui/PageFrame';
import { categories } from '../data/catalog';

export function AboutPage() {
  return (
    <PageFrame title="Nosotros" visuallyHiddenTitle fullWidth>
      <section className="relative isolate overflow-hidden border-b border-contorno bg-carbon">
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-9 pb-7 sm:px-6 sm:pt-12 lg:px-8 lg:py-24">
          <p aria-hidden="true" className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-bronce-hover uppercase">
            <span className="h-px w-7 bg-bronce" /> Nosotros
          </p>
          <h2 className="mt-4 font-display text-4xl leading-[1.08] font-bold tracking-tight text-marfil sm:text-5xl lg:text-6xl">
            La memoria de <em className="block text-bronce-hover">los objetos.</em>
          </h2>
          <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-arena sm:text-base">
            Legacy Vault es una tienda de antigüedades y coleccionables. Explora
            relojes, monedas e instrumentos a través de los materiales y oficios que los inspiran.
          </p>
        </div>

        <figure className="relative aspect-[16/10] sm:aspect-[2/1] lg:absolute lg:inset-y-0 lg:right-0 lg:w-[62%] lg:aspect-auto">
          <img
            src="/images/editorial-mesa-curaduria.webp"
            alt="Reloj de bolsillo abierto junto a una lupa de latón y un pincel sobre una mesa de madera oscura"
            width={1200}
            height={800}
            className="h-full w-full object-cover object-[center_54%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-carbon/35 via-transparent to-carbon/70 lg:bg-linear-to-r lg:from-carbon lg:via-carbon/20 lg:via-45% lg:to-transparent" />
          <figcaption className="absolute right-4 bottom-4 rounded-control bg-carbon/90 px-2.5 py-1.5 text-xs text-arena sm:right-6">
            Recreación editorial
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="about-collection" className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:py-14">
        <div className="min-w-0 lg:self-center">
          <h2 id="about-collection" className="max-w-[18ch] font-display text-3xl leading-[1.08] font-bold tracking-tight text-marfil sm:text-4xl lg:text-5xl">
            El oficio detrás de cada pieza
          </h2>
          <p className="mt-4 max-w-[49ch] leading-relaxed text-arena">
            La tapa de un reloj de bolsillo, el relieve de una moneda o el fuelle de una cámara cuentan cómo se diseñaban y se usaban estos objetos. Nuestras fichas ponen el acento en esos detalles para que puedas mirar cada pieza de cerca.
          </p>
          <Link
            to={PATHS.catalog}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-bronce px-5 py-2.5 text-sm font-bold text-carbon transition-colors hover:bg-bronce-hover"
          >
            Explorar catálogo <IconArrowRight className="size-4 shrink-0" />
          </Link>
        </div>

        <nav aria-labelledby="about-collections-nav" className="min-w-0 lg:pt-2">
          <h3 id="about-collections-nav" className="pb-2.5 text-sm font-semibold text-bronce-hover">Explorar por colección</h3>
          <ul className="divide-y divide-contorno border-y border-contorno">
            {categories.map(({ id, name }) => (
              <li key={id}>
                <Link
                  to={`${PATHS.catalog}?categoria=${id}`}
                  className="group flex min-h-12 items-center justify-between gap-3 py-3 font-display text-lg font-bold leading-tight text-marfil hover:text-bronce-hover sm:text-xl"
                >
                  {name}
                  <IconArrowRight className="size-4 shrink-0 text-bronce-hover motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

    </PageFrame>
  );
}


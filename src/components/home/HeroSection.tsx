import { useState } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { IconArrowRight } from '../ui/Icons';
import './hero.css';

const closingWord = 'historia.';

export function HeroSection() {
  const [photoFailed, setPhotoFailed] = useState(false);

  return (
    <section className="relative isolate overflow-hidden border-b border-contorno bg-pizarra py-10 sm:py-14 lg:py-16">
      {!photoFailed && (
        <picture aria-hidden="true">
          <source media="(max-width: 639px)" srcSet="/images/hero-legacy-vault-movil.webp" width={780} height={520} />
          <img
            src="/images/hero-legacy-vault.webp"
            alt=""
            width={1440}
            height={720}
            loading="eager"
            fetchPriority="high"
            onError={() => setPhotoFailed(true)}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-right sm:object-[center_52%]"
          />
        </picture>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-carbon/95 via-carbon/65 to-carbon/10 sm:via-carbon/60 sm:to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="max-w-60 text-xs font-semibold tracking-[0.18em] text-bronce-hover uppercase sm:max-w-none">
          Antigüedades y coleccionables
        </p>
        <h2 className="mt-3 max-w-[12ch] font-display text-[2rem] leading-[1.06] font-bold tracking-tight text-marfil sm:max-w-[16ch] sm:text-5xl lg:text-6xl">
          Cada objeto tiene una{' '}
          <em className="inline-block text-bronce-hover">
            <span className="sr-only">{closingWord}</span>
            <span aria-hidden="true" className="hero-typewriter">
              {[...closingWord].map((letter, index) => <span key={index}>{letter}</span>)}
            </span>
          </em>
        </h2>
        <p className="mt-4 max-w-[29ch] text-sm leading-relaxed text-marfil sm:max-w-md sm:text-lg">
          Explora nuestra selección de relojes, monedas, cámaras y piezas de colección.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-4">
          <Link
            to={PATHS.catalog}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-bronce-hover px-3 text-sm font-bold text-carbon transition-colors hover:bg-arena focus-visible:outline-2 focus-visible:outline-bronce-hover sm:px-6"
          >
            Explorar catálogo <IconArrowRight className="size-4" />
          </Link>
          <Link
            to={PATHS.collections}
            className="inline-flex min-h-11 items-center justify-center rounded-control border border-bronce-hover bg-carbon/75 px-3 text-sm font-semibold text-marfil transition-colors hover:bg-pizarra focus-visible:outline-2 focus-visible:outline-bronce-hover sm:px-6"
          >
            Ver colecciones
          </Link>
        </div>
      </div>
    </section>
  );
}


import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { PATHS } from '../../app/paths';
import { IconArrowRight } from '../ui/Icons';

export function CallToActionSection() {
  const reduceMotion = useReducedMotion();
  const canObserve = typeof IntersectionObserver !== 'undefined' && !reduceMotion;
  return (
    <section className="relative overflow-hidden bg-carbon py-20 sm:py-24">
      {/* FONDO SUTIL CON RELIEVE */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(184,137,63,0.08),transparent)] pointer-events-none" />

      <motion.div
        initial={canObserve ? { opacity: 0, y: 16 } : false}
        {...(canObserve ? { whileInView: { opacity: 1, y: 0 } } : {})}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center"
      >
        <span className="font-body text-xs font-semibold uppercase tracking-widest text-bronce">
          Coleccionismo y Patrimonio
        </span>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-marfil sm:text-4xl lg:text-5xl">
          Explora la colección completa
        </h2>
        <p className="mt-4 font-body text-base sm:text-lg leading-relaxed text-arena/80 max-w-2xl mx-auto">
          Recorre las cuatro categorías y consulta las fichas de las piezas.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={PATHS.catalog}
            className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-control bg-bronce px-8 py-3.5 font-body text-sm font-bold tracking-wide text-carbon transition-colors hover:bg-bronce-hover active:bg-[#a67b36] shadow-lg focus-visible:outline-2 focus-visible:outline-bronce"
          >
            <span>Explorar catálogo completo</span>
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={PATHS.collections}
            className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center rounded-control border border-contorno px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-marfil transition-colors hover:border-bronce hover:text-bronce focus-visible:outline-2 focus-visible:outline-bronce"
          >
            Ver colecciones temáticas
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

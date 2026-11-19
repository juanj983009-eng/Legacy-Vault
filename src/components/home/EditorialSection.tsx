import { motion, useReducedMotion } from 'motion/react';

const notes = [
  {
    title: 'Fichas de colección',
    description: 'Conoce los materiales, el diseño y los detalles de cada pieza.',
  },
  {
    title: 'Explora las colecciones',
    description: 'Descubre relojes, monedas, cámaras e instrumentos en sus propias colecciones.',
  },
  {
    title: 'Prepara tu pedido',
    description: 'Añade tus piezas al carrito y revisa el resumen antes de confirmar.',
  },
];

export function EditorialSection() {
  const reduceMotion = useReducedMotion();
  const canObserve = typeof IntersectionObserver !== 'undefined' && !reduceMotion;
  return (
    <section className="border-y border-contorno bg-madera/15 py-12 sm:py-16">
      <motion.div
        initial={canObserve ? { opacity: 0, y: 16 } : false}
        {...(canObserve ? { whileInView: { opacity: 1, y: 0 } } : {})}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="mx-auto grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12 lg:px-8"
      >
        <h2 className="max-w-xs font-display text-2xl font-bold tracking-tight text-marfil sm:text-3xl">
          Explora Legacy Vault
        </h2>
        <dl className="grid gap-5 sm:grid-cols-3 sm:gap-6">
          {notes.map(({ title, description }) => (
            <div key={title} className="border-l border-bronce/55 pl-4">
              <dt className="font-semibold text-marfil">{title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-arena/85">{description}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
}

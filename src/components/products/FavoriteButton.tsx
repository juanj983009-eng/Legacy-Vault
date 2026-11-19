import type { MouseEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useFavorites } from '../../hooks/useFavorites';
import { IconHeart } from '../ui/Icons';

export interface FavoriteButtonProps {
  productId: string;
  productName: string;
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  productId,
  productName,
  showLabel = false,
  className = '',
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const reduceMotion = useReducedMotion();
  const isFav = isFavorite(productId);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(productId);
  };

  const ariaLabel = isFav
    ? `Quitar de favoritos: ${productName}`
    : `Guardar en favoritos: ${productName}`;

  if (showLabel) {
    return (
      <motion.button
        whileTap={reduceMotion ? {} : { scale: 0.95 }}
        type="button"
        aria-pressed={isFav}
        aria-label={ariaLabel}
        onClick={handleClick}
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-bronce ${
          isFav
            ? 'border-bronce bg-bronce/15 text-bronce hover:bg-bronce/25'
            : 'border-arena/50 bg-pizarra text-marfil hover:border-bronce hover:text-bronce'
        } ${className}`}
      >
        <IconHeart filled={isFav} className="h-4 w-4" />
        <span>{isFav ? 'En favoritos' : 'Guardar en favoritos'}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={reduceMotion ? {} : { scale: 0.9 }}
      type="button"
      aria-pressed={isFav}
      aria-label={ariaLabel}
      title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      onClick={handleClick}
      className={`inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-200 focus-visible:outline-2 focus-visible:outline-bronce backdrop-blur-sm ${
        isFav
          ? 'border-bronce bg-carbon/90 text-bronce shadow-md hover:scale-105'
          : 'border-contorno/80 bg-carbon/75 text-arena/80 hover:border-bronce hover:text-bronce hover:scale-105'
      } ${className}`}
    >
      <IconHeart filled={isFav} className="h-4 w-4 sm:h-5 sm:w-5" />
      <span className="sr-only">
        {isFav ? `Quitar ${productName} de favoritos` : `Guardar ${productName} en favoritos`}
      </span>
    </motion.button>
  );
}

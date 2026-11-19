import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { IconCart } from '../ui/Icons';
import { useCart } from '../../hooks/useCart';
import type { Product } from '../../types/catalog';
import { MAX_CART_QUANTITY } from '../../utils/cart';

export function AddToCartButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { items, addItem, canAdd } = useCart();
  const [added, setAdded] = useState(false);
  const reduceMotion = useReducedMotion();
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(feedbackTimer.current), []);
  const quantity = items.find(({ productId }) => productId === product.id)?.quantity ?? 0;
  const available = product.availability === 'available' && canAdd(product.id);
  const atLimit = quantity >= MAX_CART_QUANTITY;
  const label = !available ? 'No disponible' : atLimit ? 'Máximo alcanzado' : compact ? 'Agregar' : 'Agregar al carrito';
  const accessibleLabel = available && !atLimit && compact
    ? `Agregar ${product.name} al carrito`
    : `${label}: ${product.name}`;

  return (
    <motion.button
      whileTap={reduceMotion ? {} : { scale: 0.97 }}
      type="button"
      disabled={!available || atLimit}
      aria-label={accessibleLabel}
      onClick={() => {
        addItem(product.id);
        setAdded(true);
        clearTimeout(feedbackTimer.current);
        feedbackTimer.current = setTimeout(() => setAdded(false), 2200);
      }}
      className={`inline-flex items-center justify-center gap-1.5 rounded-control font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-bronce ${added && !atLimit ? 'bg-[#4d6240] text-white hover:bg-[#5b704c]' : 'bg-bronce text-carbon hover:bg-bronce-hover'} ${compact ? 'min-h-11 px-2 text-xs' : 'min-h-11 px-5 text-sm'}`}
    >
      {added && !atLimit ? <span aria-hidden="true">✓</span> : <IconCart className="h-3.5 w-3.5 shrink-0" />}
      <span>{added && !atLimit ? 'Agregado' : label}</span>
    </motion.button>
  );
}

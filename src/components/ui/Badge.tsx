import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'neutral' | 'bronze' | 'wood' | 'unavailable';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  neutral: 'bg-pizarra/90 border-contorno text-arena',
  bronze: 'bg-bronce/10 border-bronce/40 text-bronce',
  wood: 'bg-madera/70 border-bronce/30 text-arena',
  unavailable: 'bg-superficie border-contorno/80 text-arena/60',
};

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border font-body tracking-wider uppercase ${variantStyles[variant]} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}

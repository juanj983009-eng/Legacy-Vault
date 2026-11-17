import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-bronce text-carbon font-semibold hover:bg-bronce-hover active:bg-[#a67b36] shadow-sm',
  dark: 'bg-madera font-semibold text-marfil hover:bg-madera/85 active:bg-madera focus-visible:outline-madera',
  secondary:
    'border border-bronce text-marfil hover:bg-bronce/10 active:bg-bronce/20',
  outline:
    'border border-contorno text-marfil hover:border-bronce hover:text-bronce active:bg-superficie',
  ghost:
    'text-arena hover:text-marfil hover:bg-superficie/60 active:bg-superficie',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3.5 py-1.5 text-xs',
  md: 'min-h-11 px-6 py-2.5 text-sm',
  lg: 'min-h-12 px-8 py-3.5 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-body tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-bronce focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

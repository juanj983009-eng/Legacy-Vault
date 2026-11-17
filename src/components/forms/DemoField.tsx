import type { ComponentPropsWithoutRef } from 'react';

type DemoFieldProps = ComponentPropsWithoutRef<'input'> & {
  id: string;
  label: string;
  error?: string | undefined;
  light?: boolean;
};

export function DemoField({ id, label, error, light, className = '', ...input }: DemoFieldProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold">{label}</label>
      <input {...input} id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? id + '-error' : undefined}
        className={`form-field block min-h-11 w-full min-w-0 rounded-control border px-3 py-2 text-base ${light ? 'border-madera/55 bg-marfil text-carbon [--field-focus-color:var(--color-madera)]' : 'border-arena/45 bg-carbon text-marfil'} ${className}`}
      />
      {error && <p id={id + '-error'} className={`border-l-2 pl-2 text-sm ${light ? 'border-madera text-madera' : 'border-bronce text-marfil'}`}>{error}</p>}
    </div>
  );
}

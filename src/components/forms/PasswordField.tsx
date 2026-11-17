import { useState } from 'react';
import { DemoField } from './DemoField';

export function PasswordField({ id, name, label, autoComplete, error }: {
  id: string;
  name: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  error?: string | undefined;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <DemoField id={id} name={name} label={label} type={visible ? 'text' : 'password'} autoComplete={autoComplete}
        required maxLength={72} error={error} className="pr-24" />
      <button type="button" onClick={() => setVisible(!visible)} aria-controls={id}
        aria-label={(visible ? 'Ocultar ' : 'Mostrar ') + label.toLowerCase()}
        className="absolute top-6 right-1 inline-flex min-h-11 items-center rounded-control px-2 text-xs font-semibold text-bronce-hover hover:text-marfil">
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}

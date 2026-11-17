import { useEffect, useRef, useState } from 'react';
import type { FieldErrors } from '../types/checkout';

export function useFormErrors<Field extends string>() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});

  useEffect(() => {
    const first = Object.keys(errors)[0];
    if (!first) return;
    const control = formRef.current?.elements.namedItem(first);
    if (control instanceof HTMLElement) control.focus();
  }, [errors]);

  return { formRef, errors, setErrors };
}

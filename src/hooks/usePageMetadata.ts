import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

export function usePageMetadata(title: string) {
  const heading = useRef<HTMLHeadingElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title === 'Legacy Vault' ? title : `${title} | Legacy Vault`;
    heading.current?.focus();
  }, [pathname, title]);

  return heading;
}

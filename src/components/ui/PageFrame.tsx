import type { ReactNode } from 'react';
import { usePageMetadata } from '../../hooks/usePageMetadata';

const catalogBanner = { src: '/images/vitrina-catalogo.webp', width: 1440, height: 480 };

export interface PageFrameProps {
  title: string;
  children: ReactNode;
  visuallyHiddenTitle?: boolean;
  className?: string;
  fullWidth?: boolean;
  banner?: { description: string; image?: typeof catalogBanner };
}

export function PageFrame({
  title,
  children,
  visuallyHiddenTitle = false,
  className = '',
  fullWidth = false,
  banner,
}: PageFrameProps) {
  const heading = usePageMetadata(title);

  if (banner) {
    const image = banner.image ?? catalogBanner;
    return (
      <>
        <div className="relative isolate overflow-hidden border-b border-contorno bg-pizarra">
          <img src={image.src} alt="" width={image.width} height={image.height} className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center] sm:object-[center_52%]" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-carbon via-carbon/85 to-carbon/30 sm:via-carbon/65 sm:to-transparent" />
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 min-[100rem]:max-w-none min-[100rem]:px-[4vw]">
            <h1 ref={heading} tabIndex={-1} className="border-l-2 border-bronce-hover pl-4 font-display text-3xl font-bold tracking-tight text-marfil focus:outline-none sm:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-md pl-4 text-sm leading-relaxed text-marfil sm:text-base">{banner.description}</p>
          </div>
        </div>
        <div className={`mx-auto w-full max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8 min-[100rem]:max-w-none min-[100rem]:px-[4vw] ${className}`}>{children}</div>
      </>
    );
  }

  return (
    <div className={fullWidth ? 'w-full' : `mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      <h1
        ref={heading}
        tabIndex={-1}
        className={
          visuallyHiddenTitle
            ? 'sr-only'
            : 'mb-6 font-display text-3xl font-bold tracking-tight sm:text-4xl text-marfil focus:outline-none'
        }
      >
        {title}
      </h1>
      <div className={fullWidth ? 'w-full' : 'space-y-4'}>{children}</div>
    </div>
  );
}

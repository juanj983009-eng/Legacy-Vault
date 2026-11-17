import type { ReactNode } from 'react';
import { usePageMetadata } from '../../hooks/usePageMetadata';

interface EditorialFormFrameProps {
  title: string;
  description: string;
  image: { src: string; height: number; position?: 'left' | 'right' };
  children: ReactNode;
}

export function EditorialFormFrame({ title, description, image, children }: EditorialFormFrameProps) {
  const heading = usePageMetadata(title);

  return (
    <div className="mx-auto grid max-w-7xl gap-x-12 gap-y-7 px-4 pt-8 pb-12 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:px-8 lg:pt-16 lg:pb-20">
      <header>
        <h1 ref={heading} tabIndex={-1} className="font-display text-4xl font-bold tracking-tight text-marfil focus:outline-none sm:text-5xl xl:text-6xl">
          {title}
        </h1>
        <p className="mt-3 max-w-[38ch] text-base leading-relaxed text-arena sm:mt-4">{description}</p>
        <img
          src={image.src}
          alt=""
          width={1440}
          height={image.height}
          className={`mt-6 hidden aspect-[2/1] w-full rounded-control object-cover sm:block ${image.position === 'left' ? 'object-left' : 'object-right'}`}
        />
      </header>
      <div className="min-w-0 space-y-5 border-t border-bronce/55 pt-5 lg:pt-6">{children}</div>
    </div>
  );
}


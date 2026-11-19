import { useState } from 'react';
import type { ProductImage } from '../../types/catalog';

const PLACEHOLDER = '/images/product-placeholder.svg';

type ProductPhotoProps = {
  image: ProductImage;
  className: string;
  priority?: boolean;
};

export function ProductPhoto({ image, className, priority = false }: ProductPhotoProps) {
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(image.src);

  if (image.src !== prevSrc) {
    setPrevSrc(image.src);
    setFailed(false);
  }

  return (
    <>
      <img
        src={failed ? PLACEHOLDER : image.src}
        alt={failed ? 'Recreación visual no disponible' : image.alt}
        width={768}
        height={768}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        className={className}
        onError={failed ? undefined : () => setFailed(true)}
      />
      {failed && priority && (
        <p role="status" className="absolute inset-x-4 bottom-3 z-10 rounded-control bg-carbon/90 p-2 text-center text-sm text-marfil">
          Imagen no disponible.
        </p>
      )}
    </>
  );
}

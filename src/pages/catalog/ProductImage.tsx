import { useRef, useState, type KeyboardEvent } from 'react';
import { ProductPhoto } from '../../components/products/ProductPhoto';
import type { ProductImage as ProductImageData } from '../../types/catalog';

export interface ProductImageProps {
  image?: ProductImageData;
  images?: readonly ProductImageData[];
  className?: string;
}

export function ProductImage({ image, images, className = '' }: ProductImageProps) {
  const allImages = images && images.length > 0 ? images : image ? [image] : [];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeIndex = Math.min(selectedIndex, Math.max(0, allImages.length - 1));
  const currentImage = allImages[activeIndex];

  if (!currentImage) return null;

  const hasMultiple = allImages.length > 1;

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      nextIndex = (index + 1) % allImages.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      nextIndex = (index - 1 + allImages.length) % allImages.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = allImages.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      setSelectedIndex(nextIndex);
      thumbnailRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <figure
        aria-label="Imagen de la pieza"
        className="relative grid aspect-[4/3] min-w-0 grid-rows-[minmax(0,1fr)] place-items-center overflow-hidden rounded-tarjeta border border-contorno bg-pizarra p-3 sm:p-5 shadow-sm transition-all duration-200"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,137,63,0.08),transparent_75%)] pointer-events-none" />
        <ProductPhoto
          key={currentImage.src}
          image={currentImage}
          priority
          className="relative z-10 h-full w-full min-h-0 rounded-control object-contain"
        />
        <figcaption className="pointer-events-none absolute left-3 top-3 z-20 text-xs text-arena">
          <span className="rounded-control border border-contorno/40 bg-carbon/90 px-2 py-1 text-[11px] font-medium tracking-wide">
            Recreación visual
          </span>
        </figcaption>
        {hasMultiple && (
          <span
            aria-live="polite"
            className="pointer-events-none absolute right-3 bottom-3 z-20 rounded-control bg-carbon/85 px-2 py-0.5 text-[11px] font-medium tabular-nums text-arena border border-contorno/40"
          >
            {activeIndex + 1} / {allImages.length}
          </span>
        )}
      </figure>

      {hasMultiple && (
        <ul
          aria-label="Miniaturas de la pieza"
          className="flex flex-wrap gap-2.5 pt-1"
        >
          {allImages.map((img, index) => {
            const isSelected = index === activeIndex;
            return (
              <li key={`${img.src}-${index}`}>
                <button
                  ref={(el) => {
                    thumbnailRefs.current[index] = el;
                  }}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={
                    isSelected
                      ? `Imagen ${index + 1} de ${allImages.length} (activa): ${img.alt}`
                      : `Ver imagen ${index + 1} de ${allImages.length}: ${img.alt}`
                  }
                  onClick={() => setSelectedIndex(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`relative h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-control border p-1 transition-all focus-visible:outline-2 focus-visible:outline-bronce ${
                    isSelected
                      ? 'border-bronce bg-pizarra ring-1 ring-bronce'
                      : 'border-contorno bg-carbon opacity-65 hover:opacity-100 hover:border-arena/50'
                  }`}
                >
                  <img
                    src={img.src}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full rounded-[3px] object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

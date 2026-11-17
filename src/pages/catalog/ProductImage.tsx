import { ProductPhoto } from '../../components/products/ProductPhoto';
import type { ProductImage as ProductImageData } from '../../types/catalog';

export function ProductImage({ image }: { image: ProductImageData }) {
  return (
    <figure
      aria-label="Imagen de la pieza"
      className="relative grid aspect-[4/3] min-w-0 grid-rows-[minmax(0,1fr)] place-items-center overflow-hidden rounded-tarjeta border border-contorno bg-pizarra p-2 sm:p-3"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(184,137,63,0.06),transparent_75%)] pointer-events-none" />
      <ProductPhoto
        image={image}
        priority
        className="relative z-10 h-full w-full min-h-0 rounded-control object-contain"
      />
      <figcaption className="pointer-events-none absolute left-3 top-3 z-20 text-xs text-arena">
        <span className="rounded-control bg-carbon/90 px-2 py-1">Recreación visual</span>
      </figcaption>
    </figure>
  );
}

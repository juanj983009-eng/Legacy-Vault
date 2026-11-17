export type CategoryId = 'relojes' | 'monedas' | 'camaras' | 'antiguedades';
export type Availability = 'available' | 'unavailable';
export type ProductImage = Readonly<{ src: string; alt: string }>;
export type ProductFeature = Readonly<
  { label: string; value: string } & (
    | { basis: 'demonstrative'; evidence?: never }
    | { basis: 'verified'; evidence: string }
  )
>;

export type Product = Readonly<{
  id: string;
  name: string;
  categoryId: CategoryId;
  priceCents: number;
  currency: 'PEN';
  images: readonly [ProductImage, ...ProductImage[]];
  description: string;
  features: readonly ProductFeature[];
  availability: Availability;
}>;

export type Category = Readonly<{ id: CategoryId; name: string }>;

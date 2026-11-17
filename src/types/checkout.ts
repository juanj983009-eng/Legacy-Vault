import type { ProductImage } from './catalog';
import type { CartTotals } from './cart';

export type CheckoutInput = { name: string; email: string };
export type DeliveryInput = { address: string; city: string; phone: string };
export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export type DemoOrderLine = Readonly<{
  productId: string;
  name: string;
  image: ProductImage;
  quantity: number;
  subtotalCents: number;
}>;

export type DemoOrder = Readonly<{
  id: string;
  lines: readonly DemoOrderLine[];
  totals: CartTotals;
}>;

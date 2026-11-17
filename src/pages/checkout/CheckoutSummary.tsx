import { ProductPhoto } from '../../components/products/ProductPhoto';
import { IconCart } from '../../components/ui/Icons';

import type { CartTotals } from '../../types/cart';
import type { DemoOrderLine } from '../../types/checkout';
import { formatMoney } from '../../utils/money';

export function CheckoutSummary({ lines, totals }: { lines: readonly DemoOrderLine[]; totals: CartTotals }) {
  return (
    <aside aria-labelledby="checkout-summary" className="checkout-panel min-w-0 space-y-3 p-5 sm:p-7 xl:p-8">
      <h2 id="checkout-summary" className="flex items-center gap-3 border-b border-contorno pb-3 font-display text-xl font-bold text-marfil sm:text-2xl">
        <IconCart className="size-6 shrink-0 text-bronce-hover" />
        Resumen del pedido
      </h2>
      <ul className="divide-y divide-contorno">
        {lines.map(({ productId, name, image, quantity, subtotalCents }) => (
          <li key={productId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 font-display text-sm sm:text-base">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
              <ProductPhoto image={image} className="size-11 shrink-0 rounded-control border border-contorno object-cover sm:size-16" />
              <div className="min-w-0">
                <p className="text-base leading-snug font-bold sm:text-lg">{name}</p>
                <p className="mt-1 text-sm text-arena">{quantity} {quantity === 1 ? 'unidad' : 'unidades'}</p>
              </div>
            </div>
            <span className="font-medium whitespace-nowrap tabular-nums">{formatMoney(subtotalCents)}</span>
          </li>
        ))}
      </ul>
      <dl className="font-display text-sm sm:text-base">
        <div className="flex justify-between gap-3 border-t border-contorno py-2.5">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatMoney(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-contorno py-2.5">
          <dt>Envío</dt>
          <dd className="tabular-nums">{formatMoney(totals.shippingCents)}</dd>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2 rounded-control bg-carbon/55 px-3.5 py-3 sm:px-5">
          <dt className="text-sm font-bold text-arena uppercase sm:text-lg">Total (PEN)</dt>
          <dd className="text-2xl font-bold text-bronce-hover tabular-nums sm:text-3xl">{formatMoney(totals.totalCents)}</dd>
        </div>
      </dl>
    </aside>
  );
}


import { Link } from 'react-router';
import { PATHS } from '../../app/paths';
import type { CartTotals } from '../../types/cart';
import { formatMoney } from '../../utils/money';

export function OrderSummary({ totals }: { totals: CartTotals }) {
  return (
    <aside
      aria-labelledby="cart-summary"
      className="min-w-0 space-y-5 rounded-tarjeta border border-bronce/65 bg-pizarra p-5 sm:p-6 shadow-md"
    >
      <h2 id="cart-summary" className="border-b border-contorno pb-3 font-display text-xl font-bold text-marfil">
        Resumen del carrito
      </h2>

      <dl className="space-y-3.5 text-sm text-arena">
        <div className="flex justify-between items-center gap-2">
          <dt>Unidades</dt>
          <dd className="font-medium text-marfil tabular-nums">{totals.itemCount}</dd>
        </div>
        <div className="flex justify-between items-center gap-2">
          <dt>Subtotal</dt>
          <dd className="tabular-nums font-medium text-marfil">{formatMoney(totals.subtotalCents)}</dd>
        </div>
        <div className="flex justify-between items-center gap-2">
          <dt>Envío</dt>
          <dd className="tabular-nums text-arena/70">{formatMoney(totals.shippingCents)}</dd>
        </div>

        {/* TOTAL CON JERARQUÍA REFORZADA */}
        <div className="flex flex-wrap justify-between items-baseline gap-2 border-t border-contorno pt-4 text-marfil">
          <dt className="font-display text-base font-bold">Total PEN</dt>
          <dd className="tabular-nums font-display text-xl sm:text-2xl font-bold text-bronce">
            {formatMoney(totals.totalCents)}
          </dd>
        </div>
      </dl>

      <div className="pt-2">
        <Link
          to={PATHS.checkout}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-control bg-bronce px-4 py-3 text-center text-sm font-bold text-carbon transition-colors hover:bg-bronce-hover active:bg-[#a67b36] shadow-md focus-visible:outline-2 focus-visible:outline-bronce"
        >
          Continuar con la compra
        </Link>
      </div>

    </aside>
  );
}

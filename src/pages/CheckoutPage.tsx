import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { EmptyCartState } from '../components/cart/EmptyCartState';
import { CatalogStatus } from '../components/products/CatalogStatus';
import { IconVerified } from '../components/ui/Icons';
import { useDemoAccess } from '../context/demoAccessContext';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { usePageMetadata } from '../hooks/usePageMetadata';
import type { DemoOrder } from '../types/checkout';
import { createDemoOrder, toOrderLines } from '../utils/demoOrder';
import { CheckoutForm } from './checkout/CheckoutForm';
import { CheckoutSummary } from './checkout/CheckoutSummary';
import './checkout/checkout.css';

export function CheckoutPage() {
  const { items, totals, clearCart, persistenceWarning } = useCart();
  const { alias, email } = useDemoAccess();
  const catalog = useProducts();
  const [order, setOrder] = useState<DemoOrder>();
  const [error, setError] = useState('');
  const confirmed = useRef(false);
  const title = order ? 'Confirmación del pedido' : items.length ? 'Finaliza tu pedido' : 'Finalizar compra';
  const heading = usePageMetadata(title);

  function confirmOrder() {
    if (confirmed.current || catalog.status !== 'ready') return;
    try {
      const snapshot = createDemoOrder(items, new Map(catalog.data.map((product) => [product.id, product])));
      if (!snapshot) {
        setError('Revisa la disponibilidad y las cantidades en tu carrito antes de continuar.');
        return;
      }
      confirmed.current = true;
      setOrder(snapshot);
      clearCart();
    } catch {
      setError('No pudimos confirmar el pedido. Puedes intentarlo de nuevo.');
    }
  }

  return (
    <div className="checkout-stage">
      <header className="relative isolate overflow-hidden border-b border-contorno">
        <img src="/images/editorial-balanza-checkout.webp" alt="" width={1440} height={480}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[right_60%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-carbon/95 via-carbon/85 to-carbon/45" />
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
          <h1 ref={heading} tabIndex={-1} className="font-display text-3xl leading-tight font-bold tracking-tight focus:outline-none sm:text-5xl">{title}</h1>
          {!order && <p className="mt-2 text-sm text-marfil sm:text-base">Revisa tus piezas, añade los datos de entrega y confirma tu pedido.</p>}
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {persistenceWarning && <p role="status" className="rounded-control border border-bronce/40 bg-pizarra p-3 text-sm text-arena">{persistenceWarning}</p>}
        {error && !order && (
          <p role="alert" className="rounded-control border border-error/60 bg-error/10 p-3 text-sm">
            {error}{' '}<Link to={PATHS.cart} className="font-semibold text-bronce-hover underline">Volver al carrito</Link>
          </p>
        )}
        {order ? (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <section aria-label="Confirmación" className="checkout-panel space-y-4 p-5 sm:p-7">
              <h2 className="flex items-center gap-2 font-display text-2xl font-bold"><IconVerified className="size-6 shrink-0 text-bronce-hover" /> Pedido confirmado</h2>
              <div className="border-y border-contorno py-3">
                <p className="text-xs font-semibold text-arena">Número de pedido</p>
                <p className="mt-1 wrap-break-word font-display text-lg font-bold tabular-nums text-bronce-hover">{order.id}</p>
              </div>
              <p className="text-sm leading-relaxed text-arena">Esta confirmación no genera un cobro ni un envío. El resumen se borra al salir o recargar.</p>
              <Link to={PATHS.catalog} className="inline-flex min-h-11 items-center rounded-control bg-bronce px-4 text-sm font-bold text-carbon hover:bg-bronce-hover">Explorar catálogo</Link>
            </section>
            <CheckoutSummary lines={order.lines} totals={order.totals} />
          </div>
        ) : catalog.status !== 'ready' ? (
          <CatalogStatus status={catalog.status} retry={catalog.retry} />
        ) : !items.length ? (
          <EmptyCartState />
        ) : (
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {!alias && <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-control border border-contorno bg-pizarra px-3.5 py-1.5 text-sm text-arena">
                <span>Compras como invitado</span>
                <Link to={PATHS.login} className="inline-flex min-h-11 items-center font-semibold text-bronce-hover underline underline-offset-4">Iniciar sesión</Link>
              </p>}
              <CheckoutForm onConfirm={confirmOrder} {...(email && alias ? { initialContact: { email, name: alias } } : {})} />
            </div>
            <CheckoutSummary lines={toOrderLines(items)} totals={totals} />
          </div>
        )}
      </div>
    </div>
  );
}

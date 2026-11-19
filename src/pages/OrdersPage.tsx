import { useState } from 'react';
import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { EmptyOrdersState } from '../components/orders/EmptyOrdersState';
import { IconHistory, IconInfo } from '../components/ui/Icons';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { clearOrders, INVALID_STORAGE, loadOrders } from '../services/ordersStorage';
import type { StoredDemoOrder } from '../types/orders';
import { formatMoney } from '../utils/money';

function formatOrderDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (!Number.isFinite(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function OrdersPage() {
  const heading = usePageMetadata('Mis pedidos');
  const [loadResult, setLoadResult] = useState(loadOrders);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [feedback, setFeedback] = useState<string>();

  const orders = loadResult.orders;
  const warning = loadResult.warning;
  const isCorruptStorage = orders.length === 0 && warning === INVALID_STORAGE;

  function handleRequestClear() {
    setConfirmingClear(true);
    setFeedback(undefined);
  }

  function handleCancelClear() {
    setConfirmingClear(false);
  }

  function handleConfirmClear() {
    const result = clearOrders();
    if (result.success) {
      setLoadResult({ orders: [] });
      setConfirmingClear(false);
      setFeedback(
        isCorruptStorage
          ? 'Se han eliminado los datos locales dañados. Ahora puedes iniciar un historial nuevo.'
          : 'Se ha eliminado el historial de pedidos de este navegador.'
      );
    } else {
      setConfirmingClear(false);
      setFeedback(result.warning ?? 'No se pudo eliminar el historial de pedidos.');
    }
  }

  return (
    <div className="min-h-full">
      {/* CABECERA EDITORIAL */}
      <header className="relative isolate overflow-hidden border-b border-contorno bg-carbon">
        <img
          src="/images/editorial-balanza-checkout.webp"
          alt=""
          width={1440}
          height={480}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[right_60%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-carbon/95 via-carbon/90 to-carbon/60"
        />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-widest text-arena uppercase">
                Tu colección
              </p>
              <h1
                ref={heading}
                tabIndex={-1}
                className="mt-1 font-display text-3xl font-bold tracking-tight text-marfil focus:outline-none sm:text-5xl"
              >
                Mis pedidos
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-arena sm:text-base">
                Consulta tus pedidos y vuelve a descubrir las piezas que elegiste.
              </p>
            </div>
            {orders.length > 0 && !confirmingClear && (
              <button
                type="button"
                onClick={handleRequestClear}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-contorno bg-pizarra/80 px-4 py-2 text-sm font-semibold text-marfil hover:border-error/80 hover:text-error transition-colors focus-visible:outline-2 focus-visible:outline-bronce"
              >
                <IconHistory className="size-4 shrink-0" />
                Eliminar historial
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* AVISOS TRANSPARENTES DE DEMOSTRACIÓN Y ALMACENAMIENTO */}
        <section
          aria-label="Información del historial"
          className="flex items-start gap-3 rounded-control border border-contorno bg-pizarra/40 px-4 py-3 text-sm text-arena"
        >
          <IconInfo className="mt-0.5 size-4 shrink-0 text-bronce" />
          <p>Tu historial se guarda en este navegador y no se sincroniza entre dispositivos.</p>
        </section>

        {/* FEEDBACK O CONFIRMACIÓN DE BORRADO */}
        {feedback && (
          <p
            role="status"
            aria-live="polite"
            className="rounded-control border border-bronce/60 bg-pizarra p-3 text-sm text-marfil"
          >
            {feedback}
          </p>
        )}

        {/* ADVERTENCIA SI HUBO CORRUPCIÓN O ERROR AL LEER */}
        {warning && (
          <div
            role="alert"
            className="rounded-control border border-bronce/40 bg-pizarra p-4 text-sm text-arena space-y-3"
          >
            <p>{warning}</p>
            {isCorruptStorage && !confirmingClear && (
              <div>
                <button
                  type="button"
                  onClick={handleRequestClear}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-error/60 bg-carbon px-4 py-2 text-sm font-semibold text-marfil hover:border-error hover:text-error transition-colors focus-visible:outline-2 focus-visible:outline-error"
                >
                  <IconHistory className="size-4 shrink-0" />
                  Eliminar datos dañados
                </button>
              </div>
            )}
          </div>
        )}

        {/* DIÁLOGO / CONFIRMACIÓN DE ELIMINACIÓN */}
        {confirmingClear && (
          <div
            role="region"
            aria-label="Confirmar eliminación del historial"
            className="rounded-control border border-error/60 bg-carbon p-5 space-y-3"
          >
            <h2 className="font-display text-lg font-bold text-marfil">
              {isCorruptStorage
                ? '¿Deseas eliminar los datos locales dañados y empezar un historial nuevo?'
                : '¿Deseas eliminar todo el historial de pedidos de este navegador?'}
            </h2>
            <p className="text-sm text-arena">
              {isCorruptStorage
                ? 'Esta acción eliminará el registro dañado en este navegador para que puedas registrar pedidos nuevos.'
                : 'Esta acción borrará de manera inmediata e irreversible todos los resúmenes de pedidos guardados en este dispositivo.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleConfirmClear}
                className="inline-flex min-h-11 items-center justify-center rounded-control bg-error px-4 py-2 text-sm font-semibold text-marfil hover:bg-error/90 focus-visible:outline-2 focus-visible:outline-error"
              >
                Confirmar eliminación
              </button>
              <button
                type="button"
                onClick={handleCancelClear}
                className="inline-flex min-h-11 items-center justify-center rounded-control border border-contorno bg-pizarra px-4 py-2 text-sm font-semibold text-marfil hover:border-bronce focus-visible:outline-2 focus-visible:outline-bronce"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* LISTADO DE PEDIDOS O ESTADO VACÍO */}
        {orders.length === 0 ? (
          <EmptyOrdersState />
        ) : (
          <div className="space-y-6" aria-label="Lista de pedidos">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-arena">
              <span>
                {orders.length} {orders.length === 1 ? 'pedido guardado' : 'pedidos guardados'}
              </span>
              <span>Ordenados del más reciente al más antiguo</span>
            </div>

            <div className="space-y-5">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: StoredDemoOrder }) {
  return (
    <article
      aria-labelledby={`order-heading-${order.id}`}
      className="overflow-hidden rounded-tarjeta border border-contorno bg-pizarra/70 transition-colors hover:border-bronce/60"
    >
      {/* CABECERA DEL PEDIDO */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-contorno bg-carbon/35 px-5 py-4 sm:px-6">
        <div>
          <span className="text-xs font-medium text-arena/75">Número de pedido</span>
          <h2
            id={`order-heading-${order.id}`}
            className="mt-1 break-all font-display text-lg font-bold tabular-nums text-bronce-hover"
          >
            {order.id}
          </h2>
        </div>
        <div className="sm:text-right">
          <span className="text-xs font-medium text-arena/75">Fecha de confirmación</span>
          <p className="mt-1 text-sm text-marfil tabular-nums">{formatOrderDate(order.createdAt)}</p>
        </div>
      </div>

      {/* PIEZAS DEL PEDIDO */}
      <div className="divide-y divide-contorno/50 px-5 py-1 sm:px-6">
        {order.lines.map((line) => (
          <div
            key={line.productId}
            className="flex items-center justify-between gap-3 py-4 text-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              {line.image ? (
                <img
                  src={line.image.src}
                  alt={line.image.alt}
                  width={72}
                  height={72}
                  className="size-16 shrink-0 rounded-control border border-contorno object-cover sm:size-18"
                />
              ) : (
                <div className="grid size-16 shrink-0 place-items-center rounded-control border border-contorno bg-carbon text-arena sm:size-18">
                  <IconHistory className="size-5" />
                </div>
              )}
              <div className="min-w-0">
                <Link
                  to={PATHS.product.replace(':id', line.productId)}
                  className="block font-display text-base font-bold leading-snug text-marfil transition-colors hover:text-bronce-hover"
                >
                  {line.name}
                </Link>
                <span className="mt-1 block text-xs text-arena/75">
                  Cantidad: <strong className="text-marfil">{line.quantity}</strong>
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <span className="block font-semibold tabular-nums text-marfil">
                {formatMoney(line.subtotalCents)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* TOTALES DEL PEDIDO */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-contorno/70 bg-carbon/20 px-5 py-4 sm:px-6">
        <div className="text-xs text-arena">
          <span>
            {order.totals.itemCount} {order.totals.itemCount === 1 ? 'pieza' : 'piezas'}
          </span>
          <span className="mx-2">•</span>
          <span>Envío de cortesía</span>
        </div>
        <div className="flex items-baseline gap-2 sm:justify-end">
          <span className="text-xs font-semibold uppercase tracking-wider text-arena">Total:</span>
          <span className="font-display text-xl font-bold tabular-nums text-bronce-hover">
            {formatMoney(order.totals.totalCents)}
          </span>
        </div>
      </div>
    </article>
  );
}

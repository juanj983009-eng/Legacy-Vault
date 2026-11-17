import { Link } from 'react-router';
import { PATHS } from '../app/paths';
import { EmptyCartState } from '../components/cart/EmptyCartState';
import { Button } from '../components/ui/Button';
import { IconInfo } from '../components/ui/Icons';
import { PageFrame } from '../components/ui/PageFrame';
import { CatalogStatus } from '../components/products/CatalogStatus';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { CartItem } from './cart/CartItem';
import { OrderSummary } from './cart/OrderSummary';

export function CartPage() {
  const { items, totals, increaseItem, decreaseItem, removeItem, clearCart, persistenceWarning } = useCart();

  const catalog = useProducts();

  return (
    <PageFrame title="Carrito" banner={{ description: 'Revisa tus piezas y ajusta las cantidades antes de continuar con tu pedido.' }}>
      <nav aria-label="Miga de pan" className="mb-2 text-xs text-arena/70">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link to={PATHS.home} className="hover:text-bronce transition-colors">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true" className="text-arena/40">/</li>
          <li aria-current="page" className="text-marfil font-medium">
            Carrito
          </li>
        </ol>
      </nav>
      {persistenceWarning && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-control border border-bronce/60 bg-pizarra/90 p-4 text-xs sm:text-sm text-arena shadow-sm mb-6"
        >
          <IconInfo className="h-5 w-5 text-bronce shrink-0 mt-0.5" />
          <p className="leading-relaxed">{persistenceWarning}</p>
        </div>
      )}

      {catalog.status !== 'ready' ? (
        <CatalogStatus status={catalog.status} retry={catalog.retry} />
      ) : items.length === 0 ? (
        <EmptyCartState />
      ) : (
        <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] py-4">
          <section aria-labelledby="cart-items" className="min-w-0 rounded-tarjeta border border-contorno bg-pizarra px-4 sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-contorno py-3">
              <h2 id="cart-items" className="font-display text-xl font-bold text-marfil">
                Piezas seleccionadas ({totals.itemCount})
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-xs text-arena/80 hover:text-marfil hover:border-error"
              >
                Vaciar carrito
              </Button>
            </div>

            <ul className="divide-y divide-contorno">
              {items.map((line) => (
                <CartItem
                  key={line.productId}
                  line={line}
                  onIncrease={() => increaseItem(line.productId)}
                  onDecrease={() => decreaseItem(line.productId)}
                  onRemove={() => removeItem(line.productId)}
                />
              ))}
            </ul>

            <div className="border-t border-contorno py-3">
              <Link
                className="inline-flex min-h-11 items-center text-sm font-medium text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce"
                to={PATHS.catalog}
              >
                <span aria-hidden="true">← </span>Volver al catálogo
              </Link>
            </div>
          </section>

          <OrderSummary totals={totals} />
        </div>
      )}
    </PageFrame>
  );
}

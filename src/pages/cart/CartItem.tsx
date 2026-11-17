import { generatePath, Link } from 'react-router';
import { PATHS } from '../../app/paths';
import { ProductPhoto } from '../../components/products/ProductPhoto';
import { Button } from '../../components/ui/Button';
import type { CartLine } from '../../types/cart';
import { MAX_CART_QUANTITY } from '../../utils/cart';
import { formatMoney } from '../../utils/money';

type CartItemProps = {
  line: CartLine;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export function CartItem({
  line: { product, quantity, subtotalCents },
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  return (
    <li className="grid min-w-0 grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:gap-x-5">
      {/* MINIATURA DEL PRODUCTO CON ENCUADRE LIMPIO */}
      <div className="aspect-square w-full rounded-control border border-contorno bg-carbon p-1.5 flex items-center justify-center overflow-hidden">
        <ProductPhoto image={product.images[0]} className="h-full w-full object-contain" />
      </div>

      {/* INFORMACIÓN DE LA PIEZA */}
      <div className="min-w-0 space-y-1.5 self-center">
        <h3 className="font-display text-base font-bold text-marfil">
          <Link
            to={generatePath(PATHS.product, { id: product.id })}
            className="transition-colors hover:text-bronce hover:underline focus-visible:outline-2 focus-visible:outline-bronce"
          >
            {product.name}
          </Link>
        </h3>
        <p className="text-xs sm:text-sm text-arena/80">
          Precio unitario: <span className="tabular-nums font-medium text-marfil">{formatMoney(product.priceCents)}</span>
        </p>
      </div>

      {/* CONTROLES DE CANTIDAD Y ELIMINACIÓN */}
      <div className="col-span-2 flex items-center justify-between gap-3 pt-2 border-t border-contorno/40 sm:col-span-1 sm:row-span-2 sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">
        <div
          role="group"
          aria-label={`Cantidad de ${product.name}`}
          className="inline-flex items-center gap-1 rounded-control border border-contorno bg-carbon p-1"
        >
          <Button
            variant="ghost"
            size="sm"
            className="h-11 w-11 min-h-11 p-0 text-marfil hover:bg-superficie disabled:opacity-30"
            disabled={quantity === 1}
            aria-label={`Disminuir cantidad de ${product.name}`}
            onClick={onDecrease}
          >
            −
          </Button>
          <span className="min-w-7 text-center font-body text-sm font-semibold tabular-nums text-marfil">
            {quantity}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-11 w-11 min-h-11 p-0 text-marfil hover:bg-superficie disabled:opacity-30"
            disabled={quantity === MAX_CART_QUANTITY}
            aria-label={`Aumentar cantidad de ${product.name}`}
            onClick={onIncrease}
          >
            +
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 px-2.5 text-xs text-arena/80 hover:bg-error/15 hover:text-marfil"
          aria-label={`Eliminar ${product.name} del carrito`}
          onClick={onRemove}
        >
          Eliminar
        </Button>
      </div>

      {/* SUBTOTAL DE LÍNEA */}
      <p className="col-span-2 flex items-center justify-between border-t border-contorno/60 pt-3 text-xs sm:text-sm text-arena sm:col-start-2 sm:col-span-1 sm:justify-start sm:gap-2">
        <span>Subtotal</span>
        <strong className="tabular-nums font-semibold text-bronce text-sm sm:text-base">
          {formatMoney(subtotalCents)}
        </strong>
      </p>
    </li>
  );
}

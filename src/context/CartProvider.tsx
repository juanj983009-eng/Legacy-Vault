import { useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { useProducts } from '../hooks/useProducts';
import { loadCart, saveCart } from '../services/cartStorage';
import type { CartAction, CartItem, CartState } from '../types/cart';
import { calculateCart, getCartProduct } from '../utils/cart';
import { CartContext } from './cartContext';
import { cartReducer } from './cartReducer';

export function CartProvider({ children }: { children: ReactNode }) {
  const catalog = useProducts();
  const products = catalog.status === 'ready' ? catalog.data : undefined;
  const byId = useMemo(() => new Map(products?.map((product) => [product.id, product])), [products]);
  const [initial] = useState(loadCart);
  const [state, dispatch] = useReducer(
    (current: CartState, action: CartAction) => cartReducer(current, action, byId),
    { items: initial.items, message: '' },
  );
  const [persistenceWarning, setPersistenceWarning] = useState(initial.warning);
  const lastAttempt = useRef<readonly CartItem[]>(initial.items);
  const { lines, totals } = useMemo(() => calculateCart(state.items, byId), [state.items, byId]);
  const ready = catalog.status === 'ready';
  const discarded = ready && lines.length !== state.items.length;

  useEffect(() => {
    if (!ready) return;
    const validated = discarded ? lines : state.items;
    if (validated === lastAttempt.current) return;
    lastAttempt.current = validated;
    const warning = saveCart(validated);
    let active = true;
    queueMicrotask(() => {
      if (active) setPersistenceWarning(warning ?? initial.warning);
    });
    return () => { active = false; };
  }, [discarded, initial.warning, lines, ready, state.items]);

  useEffect(() => {
    if (!state.message) return;
    const timeout = window.setTimeout(() => dispatch({ type: 'dismiss' }), 4500);
    return () => window.clearTimeout(timeout);
  }, [state.message]);

  return (
    <CartContext.Provider value={{
      items: lines,
      totals,
      itemCount: ready ? totals.itemCount : state.items.reduce((count, item) => count + item.quantity, 0),
      canAdd: (productId) => ready && Boolean(getCartProduct(productId, byId)),
      addItem: (productId) => { if (ready) dispatch({ type: 'add', productId }); },
      increaseItem: (productId) => { if (ready) dispatch({ type: 'increase', productId }); },
      decreaseItem: (productId) => { if (ready) dispatch({ type: 'decrease', productId }); },
      removeItem: (productId) => { if (ready) dispatch({ type: 'remove', productId }); },
      clearCart: () => { if (ready) dispatch({ type: 'clear' }); },
      persistenceWarning: persistenceWarning ?? (discarded ? 'Se descartaron entradas inválidas del carrito guardado.' : undefined),
    }}>
      {children}
      <div role="status" aria-label="Cambios del carrito" aria-atomic="true"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex justify-center">
        {state.message && (
          <p className="max-w-lg rounded-control border border-bronce bg-pizarra px-4 py-3 text-sm text-marfil shadow-lg">
            {state.message}
          </p>
        )}
      </div>
    </CartContext.Provider>
  );
}

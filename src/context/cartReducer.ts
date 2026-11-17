import type { CartAction, CartState } from '../types/cart';
import { getCartProduct, MAX_CART_QUANTITY, type CartCatalog } from '../utils/cart';

export function cartReducer(state: CartState, action: CartAction, catalog: CartCatalog): CartState {
  if (action.type === 'dismiss') return { ...state, message: '' };
  if (action.type === 'clear') {
    return state.items.length ? { items: [], message: 'Se vació el carrito.' } : state;
  }
  if (!('productId' in action)) return state;

  const { productId } = action;
  const product = getCartProduct(productId, catalog);
  const current = state.items.find((item) => item.productId === productId);
  if (action.type === 'remove') {
    return current
      ? { items: state.items.filter((item) => item !== current), message: `Se eliminó ${product?.name ?? 'la pieza'} del carrito.` }
      : state;
  }
  if (!product) return { ...state, message: 'Esta pieza no está disponible para agregar.' };
  if (!current && action.type !== 'add') return state;

  const quantity = (current?.quantity ?? 0) + (action.type === 'decrease' ? -1 : 1);
  if (quantity < 1) return state;
  if (quantity > MAX_CART_QUANTITY) {
    return { ...state, message: `Alcanzaste el máximo de ${MAX_CART_QUANTITY} unidades de ${product.name}.` };
  }

  const item = { productId, quantity };
  return {
    items: current ? state.items.map((line) => line === current ? item : line) : [...state.items, item],
    message: action.type === 'add'
      ? `Se agregó ${product.name} al carrito. Cantidad: ${quantity}.`
      : `Cantidad de ${product.name}: ${quantity}.`,
  };
}

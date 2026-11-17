import { useContext } from 'react';
import { CartContext } from '../context/cartContext';

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error('useCart requiere CartProvider.');
  return cart;
}

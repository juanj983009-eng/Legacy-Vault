import { useContext } from 'react';
import { ProductsContext } from '../context/productsContext';

export function useProducts() {
  const catalog = useContext(ProductsContext);
  if (!catalog) throw new Error('Falta ProductsProvider');
  return catalog;
}

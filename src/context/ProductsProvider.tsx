import type { ReactNode } from 'react';
import { useProductList } from '../hooks/useCatalogRequest';
import { ProductsContext } from './productsContext';

export function ProductsProvider({ children }: { children: ReactNode }) {
  return <ProductsContext.Provider value={useProductList()}>{children}</ProductsContext.Provider>;
}

import { createContext } from 'react';
import type { useProductList } from '../hooks/useCatalogRequest';

export const ProductsContext = createContext<ReturnType<typeof useProductList> | null>(null);

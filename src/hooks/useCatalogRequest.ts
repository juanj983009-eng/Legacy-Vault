import { useEffect, useState } from 'react';
import { getProductById, getProducts } from '../services/productsApi';

type RequestState<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; data: T };

type Result<T> = RequestState<T> & { retry: () => void };

function useCatalogRequest<T>(
  key: string,
  load: (key: string, signal: AbortSignal) => Promise<T>,
): Result<T> {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{
    key: string;
    attempt: number;
    state: RequestState<T>;
  }>();

  useEffect(() => {
    const controller = new AbortController();
    const settle = (state: RequestState<T>) => {
      if (!controller.signal.aborted) setSettled({ key, attempt, state });
    };
    void load(key, controller.signal).then(
      (data) => settle({ status: 'ready', data }),
      () => settle({ status: 'error' }),
    );
    return () => controller.abort();
  }, [key, attempt, load]);

  const state = settled?.key === key && settled.attempt === attempt
    ? settled.state
    : { status: 'loading' as const };
  return { ...state, retry: () => setAttempt((current) => current + 1) };
}

const loadProducts = (_key: string, signal: AbortSignal) => getProducts(signal);

export function useProductList() {
  return useCatalogRequest('productos', loadProducts);
}

export function useProduct(id: string | undefined) {
  return useCatalogRequest(id ?? '', getProductById);
}

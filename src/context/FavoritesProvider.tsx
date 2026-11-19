import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useProducts } from '../hooks/useProducts';
import { loadFavorites, saveFavorites } from '../services/favoritesStorage';
import { FavoritesContext } from './favoritesContext';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const catalog = useProducts();
  const products = catalog.status === 'ready' ? catalog.data : undefined;
  const byId = useMemo(() => new Map(products?.map((product) => [product.id, product])), [products]);

  const [initial] = useState(loadFavorites);
  const [favorites, setFavorites] = useState<readonly string[]>(initial.items);
  const [message, setMessage] = useState('');
  const [persistenceWarning, setPersistenceWarning] = useState(initial.warning);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(''), 4500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const isFavorite = (productId: string) => favorites.includes(productId);

  const addFavorite = (productId: string) => {
    if (!favorites.includes(productId)) {
      const next = [...favorites, productId];
      setFavorites(next);
      const warning = saveFavorites(next);
      if (warning) setPersistenceWarning(warning);
      const product = byId.get(productId);
      setMessage(product ? `Se guardó "${product.name}" en tus favoritos.` : 'Pieza guardada en favoritos.');
    }
  };

  const removeFavorite = (productId: string) => {
    if (favorites.includes(productId)) {
      const next = favorites.filter((id) => id !== productId);
      setFavorites(next);
      const warning = saveFavorites(next);
      if (warning) setPersistenceWarning(warning);
      const product = byId.get(productId);
      setMessage(product ? `Se quitó "${product.name}" de tus favoritos.` : 'Pieza quitada de favoritos.');
    }
  };

  const toggleFavorite = (productId: string) => {
    if (isFavorite(productId)) {
      removeFavorite(productId);
    } else {
      addFavorite(productId);
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
    const warning = saveFavorites([]);
    if (warning) setPersistenceWarning(warning);
    setMessage('Se vació la lista de favoritos.');
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount: favorites.length,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
        persistenceWarning,
      }}
    >
      {children}
      <div
        role="status"
        aria-label="Cambios en favoritos"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex justify-center"
      >
        {message && (
          <p className="max-w-lg rounded-control border border-bronce bg-pizarra px-4 py-3 text-sm text-marfil shadow-lg">
            {message}
          </p>
        )}
      </div>
    </FavoritesContext.Provider>
  );
}

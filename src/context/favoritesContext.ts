import { createContext } from 'react';

export type FavoritesContextValue = {
  favorites: readonly string[];
  favoriteCount: number;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  clearFavorites: () => void;
  persistenceWarning: string | undefined;
};

export const FavoritesContext = createContext<FavoritesContextValue | null>(null);

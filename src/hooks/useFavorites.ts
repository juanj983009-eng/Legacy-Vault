import { useContext } from 'react';
import { FavoritesContext } from '../context/favoritesContext';

export function useFavorites() {
  const favorites = useContext(FavoritesContext);
  if (!favorites) throw new Error('useFavorites requiere FavoritesProvider.');
  return favorites;
}

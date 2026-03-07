import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  collectionFavorites: number[];
  toggleCollectionFavorite: (collectionId: number) => void;
  isCollectionFavorite: (collectionId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem('auction-favorites');
    return stored ? JSON.parse(stored) : [];
  });

  const [collectionFavorites, setCollectionFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem('auction-collection-favorites');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('auction-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('auction-collection-favorites', JSON.stringify(collectionFavorites));
  }, [collectionFavorites]);

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  const toggleCollectionFavorite = (collectionId: number) => {
    setCollectionFavorites(prev =>
      prev.includes(collectionId)
        ? prev.filter(id => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const isCollectionFavorite = (collectionId: number) => collectionFavorites.includes(collectionId);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, toggleFavorite, isFavorite,
      collectionFavorites, toggleCollectionFavorite, isCollectionFavorite 
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

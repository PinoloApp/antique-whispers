import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './authContexts';
import { db } from '../firebase/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

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
  const { currentUser, userLoggedIn } = useAuth();
  
  const [favorites, setFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem('auction-favorites');
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.map(id => Number(id)).filter(id => !isNaN(id)) : [];
    } catch {
      return [];
    }
  });

  const [collectionFavorites, setCollectionFavorites] = useState<number[]>(() => {
    const stored = localStorage.getItem('auction-collection-favorites');
    try {
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.map(id => Number(id)).filter(id => !isNaN(id)) : [];
    } catch {
      return [];
    }
  });

  // Load from Firestore on login
  useEffect(() => {
    if (userLoggedIn && currentUser?.uid) {
      const loadFavorites = async () => {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.favorites) {
            setFavorites(prev => {
              const incoming = (data.favorites as any[]).map(id => Number(id)).filter(id => !isNaN(id));
              const combined = Array.from(new Set([...prev, ...incoming]));
              return combined;
            });
          }
          if (data.collectionFavorites) {
            setCollectionFavorites(prev => {
              const incoming = (data.collectionFavorites as any[]).map(id => Number(id)).filter(id => !isNaN(id));
              const combined = Array.from(new Set([...prev, ...incoming]));
              return combined;
            });
          }
        }
      };
      loadFavorites();
    }
  }, [userLoggedIn, currentUser?.uid]);

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem('auction-favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('auction-collection-favorites', JSON.stringify(collectionFavorites));
  }, [collectionFavorites]);

  const toggleFavorite = async (productId: number) => {
    const id = Number(productId);
    if (isNaN(id)) return;

    const isAdding = !favorites.includes(id);
    
    setFavorites(prev => 
      isAdding 
        ? [...prev, id]
        : prev.filter(item => item !== id)
    );

    if (userLoggedIn && currentUser?.uid) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          favorites: isAdding ? arrayUnion(id) : arrayRemove(id)
        });
      } catch (error) {
        console.error("Error syncing favorites to Firestore:", error);
      }
    }
  };

  const isFavorite = (productId: number) => favorites.includes(productId);

  const toggleCollectionFavorite = async (collectionId: number) => {
    const id = Number(collectionId);
    if (isNaN(id)) return;

    const isAdding = !collectionFavorites.includes(id);

    setCollectionFavorites(prev =>
      isAdding
        ? [...prev, id]
        : prev.filter(item => item !== id)
    );

    if (userLoggedIn && currentUser?.uid) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          collectionFavorites: isAdding ? arrayUnion(id) : arrayRemove(id)
        });
      } catch (error) {
        console.error("Error syncing collection favorites to Firestore:", error);
      }
    }
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

import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CollectionCard from '@/components/CollectionCard';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const Favorites = () => {
  const { favorites, collectionFavorites } = useFavorites();
  const { t, language } = useLanguage();
  const { products, collections } = useData();

  const collectionProductIds = new Set(collections.flatMap(c => c.productIds));
  const favoriteProducts = products.filter(p => favorites.some(id => Number(id) === Number(p.id)) && !collectionProductIds.has(p.id) && p.status !== 'withdrawn');
  const favoriteCollections = collections.filter(c => collectionFavorites.some(id => Number(id) === Number(c.id)) && c.status !== 'withdrawn');
  const totalCount = favoriteProducts.length + favoriteCollections.length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {totalCount > 0 && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                <Heart className="w-8 h-8 text-primary fill-primary" />
              </div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
                {t('favorites.title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {totalCount} {totalCount === 1 ? t('favorites.item') : t('favorites.items')}
              </p>
            </div>
          )}
          
          {totalCount > 0 ? (
            <div className="space-y-10">
              {/* Favorite Collections */}
              {favoriteCollections.length > 0 && (
                <div>
                  {favoriteProducts.length > 0 && (
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                      {language === "en" ? "Collections" : "Kolekcije"}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteCollections.map((collection, index) => (
                      <div
                        key={collection.id}
                        className="animate-fade-in h-full"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CollectionCard collection={collection} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Products */}
              {favoriteProducts.length > 0 && (
                <div>
                  {favoriteCollections.length > 0 && (
                    <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                      {language === "en" ? "Lots" : "Lotovi"}
                    </h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in h-full"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-6">
                <Heart className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">
                {t('favorites.empty')}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {t('favorites.emptyDescription')}
              </p>
              <Link to="/#featured-lots">
                <Button size="lg" className="gap-2">
                  {t('favorites.browse')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Favorites;

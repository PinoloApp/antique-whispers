import { useFavorites } from '@/contexts/FavoritesContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useData } from '@/contexts/DataContext';
import ProductCard from '@/components/ProductCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const FavoritesSection = () => {
  const { favorites } = useFavorites();
  const { language } = useLanguage();
  const { products, collections } = useData();
  const [isOpen, setIsOpen] = useState(true);

  const collectionProductIds = new Set(collections.flatMap(c => c.productIds));
  const favoriteProducts = products.filter(p => favorites.includes(p.id) && !collectionProductIds.has(p.id));

  if (favoriteProducts.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-center mb-8">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="gap-2 text-xl font-serif font-bold text-foreground hover:bg-transparent">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                {language === 'en' ? 'My Favorites' : 'Moji Favoriti'}
                <span className="text-sm font-normal text-muted-foreground">({favoriteProducts.length})</span>
                {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent>
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
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

export default FavoritesSection;

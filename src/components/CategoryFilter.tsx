import { useLanguage } from '@/contexts/LanguageContext';

interface Category {
  id: string;
  key: string;
  title: { en: string; sr: string };
  description: { en: string; sr: string };
  subcategories: Array<{
    id: string;
    key: string;
    title: { en: string; sr: string };
    description: { en: string; sr: string };
  }>;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) => {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
            selectedCategory === 'all'
              ? 'bg-primary text-primary-foreground shadow-soft'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          }`}
        >
          {t('search.all')}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            <span>{category.title?.[language as 'en' | 'sr'] || category.title?.sr || category.key}</span>
          </button>
        ))}
      </div>
      
      {/* Category Description - only shown when a specific category is selected */}
      {selectedCategory !== 'all' && categories.find(c => c.id === selectedCategory) && (
        <div className="text-center p-6 bg-card rounded-lg border border-border animate-fade-in">
          <p className="text-muted-foreground">
            {categories.find(c => c.id === selectedCategory)?.description[language as 'en' | 'sr']}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;

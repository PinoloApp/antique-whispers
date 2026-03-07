import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, Category, Collection } from '@/contexts/DataContext';

interface Suggestion {
  type: 'product' | 'category' | 'subcategory' | 'lot' | 'catalog' | 'history' | 'collection';
  label: string;
  value: string;
}

interface SearchAutocompleteProps {
  products: Product[];
  categories: Category[];
  collections?: Collection[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 5;

const getSearchHistory = (): string[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveSearchHistory = (history: string[]) => {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    // Ignore storage errors
  }
};

const SearchAutocomplete = ({
  products,
  categories,
  collections = [],
  value,
  onChange,
  placeholder
}: SearchAutocompleteProps) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<string[]>(getSearchHistory);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add to search history
  const addToHistory = useCallback((term: string) => {
    if (!term.trim()) return;
    
    const trimmed = term.trim();
    const updated = [trimmed, ...searchHistory.filter(h => h.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_HISTORY);
    setSearchHistory(updated);
    saveSearchHistory(updated);
  }, [searchHistory]);

  // Remove from history
  const removeFromHistory = useCallback((term: string) => {
    const updated = searchHistory.filter(h => h !== term);
    setSearchHistory(updated);
    saveSearchHistory(updated);
  }, [searchHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    saveSearchHistory([]);
  }, []);

  // Generate history suggestions when input is empty/short
  const historySuggestions = useMemo((): Suggestion[] => {
    if (value.trim().length >= 2) return [];
    return searchHistory.map(term => ({
      type: 'history' as const,
      label: term,
      value: term
    }));
  }, [value, searchHistory]);

  // Generate suggestions based on input
  const suggestions = useMemo(() => {
    if (!value.trim() || value.length < 2) return [];

    const query = value.toLowerCase().trim();
    const results: Suggestion[] = [];
    const seen = new Set<string>();

    // Search in collections
    collections.forEach(col => {
      const colName = language === 'en' ? col.name.en : col.name.sr;
      const colDesc = language === 'en' ? col.description.en : col.description.sr;
      if (
        (colName.toLowerCase().includes(query) || colDesc.toLowerCase().includes(query) || col.lotNumber.toLowerCase().includes(query)) &&
        !seen.has(`col-${col.id}`)
      ) {
        seen.add(`col-${col.id}`);
        results.push({
          type: 'collection',
          label: colName,
          value: colName,
        });
      }
    });

    // Search in categories
    categories.forEach(cat => {
      const catName = language === 'en' ? cat.description.en : cat.description.sr;
      if (catName.toLowerCase().includes(query) && !seen.has(`cat-${cat.id}`)) {
        seen.add(`cat-${cat.id}`);
        results.push({
          type: 'category',
          label: catName,
          value: catName,
        });
      }

      // Search in subcategories
      cat.subcategories.forEach(sub => {
        const subName = language === 'en' ? sub.description.en : sub.description.sr;
        if (subName.toLowerCase().includes(query) && !seen.has(`sub-${sub.id}`)) {
          seen.add(`sub-${sub.id}`);
          results.push({
            type: 'subcategory',
            label: subName,
            value: subName,
          });
        }
      });
    });

    // Search in products
    products.forEach(product => {
      const productName = language === 'en' ? product.name : product.namesr;
      
      // Product name match
      if (productName.toLowerCase().includes(query) && !seen.has(`prod-${product.id}`)) {
        seen.add(`prod-${product.id}`);
        results.push({
          type: 'product',
          label: productName,
          value: productName
        });
      }

      // Lot number match
      if (product.lot.toLowerCase().includes(query) && !seen.has(`lot-${product.lot}`)) {
        seen.add(`lot-${product.lot}`);
        results.push({
          type: 'lot',
          label: `${language === 'en' ? 'Lot' : 'Lot'} ${product.lot}`,
          value: product.lot
        });
      }

      // Catalog mark match
      if (product.catalogMark.toLowerCase().includes(query) && !seen.has(`cat-${product.catalogMark}`)) {
        seen.add(`cat-${product.catalogMark}`);
        results.push({
          type: 'catalog',
          label: product.catalogMark,
          value: product.catalogMark
        });
      }
    });

    return results.slice(0, 8); // Limit to 8 suggestions
  }, [value, products, categories, collections, language]);

  // Combined suggestions (history or regular)
  const displaySuggestions = value.trim().length >= 2 ? suggestions : historySuggestions;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || displaySuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < displaySuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : displaySuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && displaySuggestions[highlightedIndex]) {
          const selected = displaySuggestions[highlightedIndex];
          onChange(selected.value);
          addToHistory(selected.value);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.value);
    addToHistory(suggestion.value);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getTypeLabel = (type: Suggestion['type']) => {
    const labels = {
      product: language === 'en' ? 'Product' : 'Proizvod',
      category: language === 'en' ? 'Category' : 'Kategorija',
      subcategory: language === 'en' ? 'Subcategory' : 'Podkategorija',
      lot: language === 'en' ? 'Lot' : 'Lot',
      catalog: language === 'en' ? 'Catalog' : 'Katalog',
      history: language === 'en' ? 'Recent' : 'Nedavno',
      collection: language === 'en' ? 'Collection' : 'Kolekcija',
    };
    return labels[type];
  };

  const getTypeBadgeClass = (type: Suggestion['type']) => {
    const classes = {
      product: 'bg-burgundy/20 text-burgundy',
      category: 'bg-gold/20 text-gold',
      subcategory: 'bg-secondary/50 text-secondary-foreground',
      lot: 'bg-primary/20 text-primary',
      catalog: 'bg-muted text-muted-foreground',
      history: 'bg-muted text-muted-foreground',
      collection: 'bg-gold/30 text-gold-foreground font-medium',
    };
    return classes[type];
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <span key={i} className="bg-gold/40 font-semibold">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || t('search.placeholder')}
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-10 py-6 text-base bg-muted/50 border-border focus:bg-background rounded-full"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && displaySuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
          {/* History Header */}
          {value.trim().length < 2 && searchHistory.length > 0 && (
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-xs font-medium text-muted-foreground">
                {language === 'en' ? 'Recent Searches' : 'Nedavne pretrage'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                }}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {language === 'en' ? 'Clear' : 'Obriši'}
              </button>
            </div>
          )}
          
          <ul className="py-2">
            {displaySuggestions.map((suggestion, index) => (
              <li key={`${suggestion.type}-${suggestion.value}-${index}`}>
                <div
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                    highlightedIndex === index 
                      ? 'bg-muted' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    {suggestion.type === 'history' ? (
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Search className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">
                        {highlightMatch(suggestion.label, value)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeClass(suggestion.type)}`}>
                      {getTypeLabel(suggestion.type)}
                    </span>
                  </button>
                  
                  {/* Delete button for history items */}
                  {suggestion.type === 'history' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(suggestion.value);
                      }}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title={language === 'en' ? 'Remove from history' : 'Ukloni iz istorije'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;

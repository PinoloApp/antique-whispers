import { useState, useMemo, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";
import SearchAutocomplete from "@/components/SearchAutocomplete";
import CollectionCard from "@/components/CollectionCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { useAuctions } from "@/hooks/useAuctions";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DualSlider } from "@/components/ui/dual-slider";
import { ArrowUpDown, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type SortOption = "lot-asc" | "lot-desc" | "price-asc" | "price-desc" | "name-asc" | "name-desc";


const ITEMS_PER_PAGE_OPTIONS = [8, 12, 24, 48];

const Index = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const { products, collections } = useData();
  const { auctions, loading } = useAuctions();
  const { categories } = useCategories();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.hash]);

  const categoryFromUrl = searchParams.get("category");
  const subcategoryFromUrl = searchParams.get("subcategory");

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "all");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategoryFromUrl || null);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
      setSelectedSubcategory(subcategoryFromUrl || null);
      setSearchParams({}, { replace: true });
      setTimeout(() => {
        document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [categoryFromUrl, subcategoryFromUrl]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("lot-asc");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Sort auctions: active first, then upcoming, paused, then completed/cancelled
  const sortedAuctions = useMemo(() => {
    return [...auctions].sort((a, b) => {
      const statusOrder: Record<string, number> = { active: 0, upcoming: 1, paused: 2, completed: 3, cancelled: 4 };
      return (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
    });
  }, [auctions]);

  const [selectedAuctionId, setSelectedAuctionId] = useState<number | null>(null);

  // Auto-select first auction when data loads
  useEffect(() => {
    if (sortedAuctions.length > 0 && selectedAuctionId === null) {
      setSelectedAuctionId(sortedAuctions[0].id);
    }
  }, [sortedAuctions]);

  // Get active auctions (upcoming)
  const activeAuctions = useMemo(() => {
    return auctions.filter((a) => a.status === "upcoming");
  }, [auctions]);

  // Get relevant collection IDs and lot IDs based on selected auction
  const relevantCollectionIds = useMemo(() => {
    const ids = new Set<number>();
    if (selectedAuctionId) {
      const selectedAuction = auctions.find((a) => a.id === selectedAuctionId);
      if (selectedAuction) {
        selectedAuction.collectionIds?.forEach((cid) => ids.add(cid));
      }
    } else {
      activeAuctions.forEach((auction) => {
        auction.collectionIds?.forEach((cid) => ids.add(cid));
      });
    }
    return ids;
  }, [activeAuctions, auctions, selectedAuctionId]);

  const relevantCollections = useMemo(() => {
    return collections.filter((c) => relevantCollectionIds.has(c.id));
  }, [collections, relevantCollectionIds]);

  // Filter collections by search query + category/subcategory (same filter as lots)
  const filteredCollections = useMemo(() => {
    let result = relevantCollections;

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((c) => c.category === selectedCategory);
    }
    // Subcategory filter
    if (selectedSubcategory) {
      result = result.filter((c) => c.subcategory === selectedSubcategory);
    }
    // Search filter
    if (searchQuery.trim() && searchQuery.length >= 2) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((c) => {
        const nameEn = c.name.en.toLowerCase();
        const nameSr = c.name.sr.toLowerCase();
        const descEn = c.description.en.toLowerCase();
        const descSr = c.description.sr.toLowerCase();
        const lotNum = c.lotNumber.toLowerCase();
        return nameEn.includes(query) || nameSr.includes(query) || descEn.includes(query) || descSr.includes(query) || lotNum.includes(query);
      });
    }
    return result;
  }, [relevantCollections, selectedCategory, selectedSubcategory, searchQuery]);

  // Product IDs that belong to collections (should be excluded from individual lots)
  const collectionProductIds = useMemo(() => {
    const ids = new Set<number>();
    relevantCollections.forEach((c) => c.productIds.forEach((pid) => ids.add(pid)));
    return ids;
  }, [relevantCollections]);

  // Get lot IDs based on selected auction or all active auctions
  const relevantLotIds = useMemo(() => {
    const lotIds = new Set<number>();

    if (selectedAuctionId) {
      const selectedAuction = auctions.find((a) => a.id === selectedAuctionId);
      if (selectedAuction) {
        selectedAuction.lotIds.forEach((lotId) => lotIds.add(lotId));
      }
    } else {
      activeAuctions.forEach((auction) => {
        auction.lotIds.forEach((lotId) => lotIds.add(lotId));
      });
    }
    return lotIds;
  }, [activeAuctions, auctions, selectedAuctionId]);

  // Get products based on relevant lot IDs, excluding those in collections
  const relevantProducts = useMemo(() => {
    return products.filter((p) => relevantLotIds.has(p.id) && !collectionProductIds.has(p.id));
  }, [products, relevantLotIds, collectionProductIds]);

  // Calculate min and max prices for the slider
  const priceStats = useMemo(() => {
    if (relevantProducts.length === 0) return { min: 0, max: 100000 };
    const prices = relevantProducts.map((p) => p.currentBid);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [relevantProducts]);

  // Filter categories to only show those with products or collections in relevant auctions
  const displayCategories = useMemo(() => {
    const relevantCategoryIds = new Set([
      ...relevantProducts.map((p) => p.category),
      ...relevantCollections.map((c) => c.category),
    ]);
    return categories.filter((c) => relevantCategoryIds.has(c.id));
  }, [categories, relevantProducts, relevantCollections]);

  // Get the next upcoming auction date
  const nextAuctionDate = useMemo(() => {
    const upcoming = auctions
      .filter((a) => a.status === "upcoming")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming[0]?.date || null;
  }, [auctions]);

  // Get subcategories for selected category (those with relevant products or collections)
  const currentSubcategories = useMemo(() => {
    if (selectedCategory === "all") return [];
    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) return [];

    const relevantSubcategoryIds = new Set([
      ...relevantProducts.filter((p) => p.category === selectedCategory).map((p) => p.subcategory),
      ...relevantCollections.filter((c) => c.category === selectedCategory).map((c) => c.subcategory),
    ]);
    return category.subcategories.filter((sub) => relevantSubcategoryIds.has(sub.id));
  }, [selectedCategory, categories, relevantProducts, relevantCollections]);

  // Filter products based on selection
  const filteredProducts = useMemo(() => {
    return relevantProducts.filter((product) => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
      const matchesPrice = product.currentBid >= priceRange[0] && product.currentBid <= priceRange[1];

      if (!searchQuery.trim()) {
        return matchesCategory && matchesSubcategory && matchesPrice;
      }

      const query = searchQuery.toLowerCase().trim();

      // Get category and subcategory names for searching
      const category = categories.find((c) => c.id === product.category);
      const subcategory = category?.subcategories.find((s) => s.id === product.subcategory);

      const categoryName = category
        ? (language === "en" ? category.description.en : category.description.sr).toLowerCase()
        : "";
      const categoryKey = category?.key.toLowerCase() || "";
      const subcategoryName = subcategory
        ? (language === "en" ? subcategory.description.en : subcategory.description.sr).toLowerCase()
        : "";
      const subcategoryKey = subcategory?.key.toLowerCase() || "";

      // Search in product name (both languages)
      const nameEn = product.name.toLowerCase();
      const nameSr = product.namesr.toLowerCase();

      // Search in lot number and catalog mark
      const lotNumber = product.lot.toLowerCase();
      const catalogMark = product.catalogMark.toLowerCase();

      const matchesSearch =
        nameEn.includes(query) ||
        nameSr.includes(query) ||
        lotNumber.includes(query) ||
        catalogMark.includes(query) ||
        categoryName.includes(query) ||
        categoryKey.includes(query) ||
        subcategoryName.includes(query) ||
        subcategoryKey.includes(query);

      return matchesCategory && matchesSubcategory && matchesPrice && matchesSearch;
    });
  }, [selectedCategory, selectedSubcategory, searchQuery, language, relevantProducts, categories, priceRange]);

  // Combine filtered products and collections
  const filteredItems = useMemo(() => {
    return [...filteredCollections, ...filteredProducts];
  }, [filteredProducts, filteredCollections]);

  // Sort unified items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems];

    switch (sortOption) {
      case "lot-asc":
        return sorted.sort((a, b) => {
          const lotA = 'lotNumber' in a ? a.lotNumber : a.lot;
          const lotB = 'lotNumber' in b ? b.lotNumber : b.lot;
          return (lotA || "").localeCompare(lotB || "", undefined, { numeric: true });
        });
      case "lot-desc":
        return sorted.sort((a, b) => {
          const lotA = 'lotNumber' in a ? a.lotNumber : a.lot;
          const lotB = 'lotNumber' in b ? b.lotNumber : b.lot;
          return (lotB || "").localeCompare(lotA || "", undefined, { numeric: true });
        });
      case "price-asc":
        return sorted.sort((a, b) => (a.currentBid || 0) - (b.currentBid || 0));
      case "price-desc":
        return sorted.sort((a, b) => (b.currentBid || 0) - (a.currentBid || 0));
      case "name-asc":
        return sorted.sort((a, b) => {
          const nameA = 'lotNumber' in a ? a.name[language as "en" | "sr"] : (language === "en" ? a.name : a.namesr);
          const nameB = 'lotNumber' in b ? b.name[language as "en" | "sr"] : (language === "en" ? b.name : b.namesr);
          return (nameA || "").localeCompare(nameB || "");
        });
      case "name-desc":
        return sorted.sort((a, b) => {
          const nameA = 'lotNumber' in a ? a.name[language as "en" | "sr"] : (language === "en" ? a.name : a.namesr);
          const nameB = 'lotNumber' in b ? b.name[language as "en" | "sr"] : (language === "en" ? b.name : b.namesr);
          return (nameB || "").localeCompare(nameA || "");
        });
      default:
        return sorted;
    }
  }, [filteredItems, sortOption, language]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedItems.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedItems, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedSubcategory, searchQuery, priceRange, sortOption, itemsPerPage]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleAuctionSelect = (auctionId: number | null) => {
    setSelectedAuctionId(auctionId);
    setSelectedCategory("all");
    setSelectedSubcategory(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById("auctions")?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  // Get selected category description
  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <HeroSection
          nextAuctionDate={nextAuctionDate}
          auctions={auctions}
          loading={loading}
          selectedAuctionId={selectedAuctionId}
          onSelectAuction={handleAuctionSelect}
        />

        {/* All Lots and Collections Section */}
        {auctions.length > 0 && (relevantProducts.length > 0 || relevantCollections.length > 0) && (
          <section id="featured-lots" className="py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  {language === "en" ? "All Lots and Collections" : "Svi Lotovi i Kolekcije"}
                </h2>
                <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full mb-6" />

                {/* Search */}
                <div className="max-w-md mx-auto mb-6">
                  <SearchAutocomplete products={relevantProducts} categories={displayCategories} collections={relevantCollections} value={searchQuery} onChange={setSearchQuery} />
                </div>
              </div>

              {/* Lot filters: category + subcategory */}
              <div id="categories" className="mb-8">
                <CategoryFilter categories={displayCategories} selectedCategory={selectedCategory} onSelectCategory={handleCategorySelect} />
              </div>

              {currentSubcategories.length > 0 && (
                <div className="mb-8 animate-fade-in">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button onClick={() => setSelectedSubcategory(null)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!selectedSubcategory ? "bg-secondary text-secondary-foreground shadow-soft" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                      {language === "en" ? "All" : "Sve"}
                    </button>
                    {currentSubcategories.map((sub) => (
                      <button key={sub.id} onClick={() => setSelectedSubcategory(sub.id)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedSubcategory === sub.id ? "bg-secondary text-secondary-foreground shadow-soft" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                        {sub.title?.[language as "en" | "sr"] || sub.title?.sr || sub.key}
                      </button>
                    ))}
                  </div>
                  {selectedSubcategory && (
                    <div className="text-center mt-4 p-4 bg-muted/30 rounded-lg animate-fade-in">
                      <p className="text-sm text-muted-foreground">
                        {currentSubcategories.find((s) => s.id === selectedSubcategory)?.description[language]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <p className="text-sm text-muted-foreground">
                  {(() => {
                    const prods = sortedItems.filter(i => !('lotNumber' in i)).length;
                    const cols = sortedItems.filter(i => 'lotNumber' in i).length;
                    
                    const lotLabel = language === "en"
                      ? `${prods} ${prods === 1 ? "item" : "items"}`
                      : `${prods} ${prods === 1 ? "lot" : prods % 10 >= 2 && prods % 10 <= 4 && (prods % 100 < 10 || prods % 100 >= 20) ? "lota" : "lotova"}`;
                    
                    const colLabel = language === "en"
                      ? `${cols} ${cols === 1 ? "collection" : "collections"}`
                      : `${cols} ${cols === 1 ? "kolekcija" : cols % 10 >= 2 && cols % 10 <= 4 && (cols % 100 < 10 || cols % 100 >= 20) ? "kolekcije" : "kolekcija"}`;
                      
                    return cols > 0 ? <span>{lotLabel} + {colLabel}</span> : <span>{lotLabel}</span>;
                  })()}
                </p>
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2 bg-muted/50 hover:bg-muted/50 hover:text-foreground">
                        <SlidersHorizontal className="w-4 h-4" />
                        <span className="hidden sm:inline">{language === "en" ? "Price" : "Cena"}:</span>
                        <span className="text-burgundy font-medium">€{priceRange[0].toLocaleString()} - €{priceRange[1].toLocaleString()}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{language === "en" ? "Price Range" : "Opseg cena"}</h4>
                          <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => setPriceRange([priceStats.min, priceStats.max])}>
                            {language === "en" ? "Reset" : "Resetuj"}
                          </Button>
                        </div>
                        <DualSlider value={priceRange} min={priceStats.min} max={priceStats.max} step={100} onValueChange={(value) => setPriceRange(value as [number, number])} className="py-4" />
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Min</span>
                            <span className="font-medium text-burgundy">€{priceRange[0].toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-muted-foreground">Max</span>
                            <span className="font-medium text-burgundy">€{priceRange[1].toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <Select value={sortOption} onValueChange={(val) => setSortOption(val as SortOption)}>
                      <SelectTrigger className="w-[180px] bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lot-asc">{language === "en" ? "Lot: Low to High" : "Lot: Rastući"}</SelectItem>
                        <SelectItem value="lot-desc">{language === "en" ? "Lot: High to Low" : "Lot: Opadajući"}</SelectItem>
                        <SelectItem value="price-asc">{language === "en" ? "Price: Low to High" : "Cena: Rastući"}</SelectItem>
                        <SelectItem value="price-desc">{language === "en" ? "Price: High to Low" : "Cena: Opadajući"}</SelectItem>
                        <SelectItem value="name-asc">{language === "en" ? "Name: A to Z" : "Naziv: A do Ž"}</SelectItem>
                        <SelectItem value="name-desc">{language === "en" ? "Name: Z to A" : "Naziv: Ž do A"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedItems.map((item, index) => (
                  <div key={`${'lotNumber' in item ? 'col' : 'prod'}-${item.id}`} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    {'lotNumber' in item ? (
                      <CollectionCard collection={item as any} />
                    ) : (
                      <ProductCard product={item as any} searchQuery={searchQuery} />
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{language === "en" ? "Show" : "Prikaži"}:</span>
                    <Select value={itemsPerPage.toString()} onValueChange={(val) => setItemsPerPage(Number(val))}>
                      <SelectTrigger className="w-[70px] h-8 bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ITEMS_PER_PAGE_OPTIONS.map((num) => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span>{language === "en" ? "per page" : "po stranici"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {getPageNumbers().map((page, idx) =>
                      page === "ellipsis" ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                      ) : (
                        <Button key={page} variant={currentPage === page ? "default" : "outline"} size="icon" className={`h-8 w-8 ${currentPage === page ? "bg-burgundy hover:bg-burgundy/90" : ""}`} onClick={() => handlePageChange(page)}>
                          {page}
                        </Button>
                      ),
                    )}
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? `Page ${currentPage} of ${totalPages}` : `Stranica ${currentPage} od ${totalPages}`}
                  </p>
                </div>
              )}

              {sortedItems.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">
                    {language === "en" ? "No items found matching your criteria." : "Nema pronađenih predmeta koji odgovaraju vašim kriterijumima."}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;

import React from "react";
import { ChevronDown, ChevronRight, ChevronUp, Search, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product, Category, BidStep } from "@/contexts/DataContext";

export interface LotsSectionProps {
    language: "en" | "sr";
    lotsExpanded: boolean;
    setLotsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setStepsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setCollectionsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    selectedLots: number[];
    formLotSearch: string;
    setFormLotSearch: React.Dispatch<React.SetStateAction<string>>;
    expandedCategories: string[];
    expandedSubcategories: string[];
    availableProducts: Product[];
    toggleCategory: (categoryId: string) => void;
    toggleSubcategory: (subcategoryId: string) => void;
    toggleLot: (productId: number) => void;
    selectAllInCategory: (categoryId: string) => void;
    deselectAllInCategory: (categoryId: string) => void;
    selectAllInSubcategory: (categoryId: string, subcategoryId: string) => void;
    deselectAllInSubcategory: (categoryId: string, subcategoryId: string) => void;
    isCategoryFullySelected: (categoryId: string) => boolean;
    isSubcategoryFullySelected: (categoryId: string, subcategoryId: string) => boolean;
    getFilteredCategoriesWithAvailableProducts: () => Category[];
    getFilteredSubcategoriesWithAvailableProducts: (categoryId: string) => any[];
    getFilteredProductsBySubcategory: (categoryId: string, subcategoryId: string) => Product[];
    getFilteredProductsWithoutSubcategory: (categoryId: string) => Product[];
    disabled?: boolean;
}

export const LotsSection: React.FC<LotsSectionProps> = ({
    language,
    lotsExpanded,
    setLotsExpanded,
    setStepsExpanded,
    setCollectionsExpanded,
    selectedLots,
    formLotSearch,
    setFormLotSearch,
    expandedCategories,
    expandedSubcategories,
    availableProducts,
    toggleCategory,
    toggleSubcategory,
    toggleLot,
    selectAllInCategory,
    deselectAllInCategory,
    selectAllInSubcategory,
    deselectAllInSubcategory,
    isCategoryFullySelected,
    isSubcategoryFullySelected,
    getFilteredCategoriesWithAvailableProducts,
    getFilteredSubcategoriesWithAvailableProducts,
    getFilteredProductsBySubcategory,
    getFilteredProductsWithoutSubcategory,
    disabled,
}) => {
    return (
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${lotsExpanded ? "flex-1 min-h-0" : ""}`}>
            <button
                type="button"
                onClick={() => {
                    if (disabled && !lotsExpanded) return;
                    setLotsExpanded(!lotsExpanded);
                    if (!lotsExpanded) { setStepsExpanded(false); setCollectionsExpanded(false); }
                }}
                className={`flex items-center justify-between w-full p-3 border rounded-md hover:bg-muted/50 transition-all duration-300 cursor-pointer shrink-0 ${lotsExpanded ? "rounded-b-none border-b-0" : ""} ${disabled ? "opacity-70" : ""}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        {lotsExpanded
                            ? language === "en" ? "Available Lots" : "Dostupni Lotovi"
                            : language === "en" ? "Add Lots" : "Dodaj lotove"}
                    </span>
                    {selectedLots.length > 0 && (
                        <Badge className="bg-secondary text-white">
                            {selectedLots.length} {language === "en" ? "selected" : "izabrano"}
                        </Badge>
                    )}
                </div>
                <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${lotsExpanded ? "rotate-0" : "rotate-180"}`} />
            </button>
            <div className={`border border-t-0 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out flex flex-col ${lotsExpanded ? "flex-1 min-h-0" : "max-h-0 opacity-0"}`}>
                <div className="p-2 border-b border-border shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={language === "en" ? "Search lots..." : "Pretraži lotove..."}
                            value={formLotSearch}
                            onChange={(e) => setFormLotSearch(e.target.value)}
                            className="pl-8 h-8 text-sm"
                            disabled={disabled}
                        />
                    </div>
                </div>
                <ScrollArea className={`p-2 flex-1 min-h-0 ${lotsExpanded ? "" : "h-0"}`}>
                    {getFilteredCategoriesWithAvailableProducts().length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            {language === "en" ? "No available lots" : "Nema dostupnih lotova"}
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {getFilteredCategoriesWithAvailableProducts().map((category) => {
                                const categoryLotCount = availableProducts.filter((p) => p.category === category.id).length;
                                const isFullySelected = isCategoryFullySelected(category.id);
                                return (
                                    <div key={category.id} className="space-y-1">
                                        <div className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors">
                                            <button type="button" className="flex items-center gap-2 flex-1 text-left" onClick={() => toggleCategory(category.id)}>
                                                {expandedCategories.includes(category.id) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                <span className="font-medium">{category.title[language]}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Package className="w-3 h-3" />{categoryLotCount}
                                                </span>
                                                <span className="flex-1" />
                                            </button>
                                             <label className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"}`} onClick={(e) => { if (disabled) e.preventDefault(); e.stopPropagation(); }}>
                                                <Checkbox checked={isFullySelected} onCheckedChange={(checked) => { if (disabled) return; if (checked) selectAllInCategory(category.id); else deselectAllInCategory(category.id); }} disabled={disabled} />
                                                <span className="text-xs text-muted-foreground">Odaberi sve</span>
                                            </label>
                                        </div>

                                        {(expandedCategories.includes(category.id) || formLotSearch.trim()) && (
                                            <div className="ml-6 space-y-1">
                                                {getFilteredSubcategoriesWithAvailableProducts(category.id).map((subcategory: any) => {
                                                    const subcategoryLotCount = getFilteredProductsBySubcategory(category.id, subcategory.id).length;
                                                    const isSubFullySelected = isSubcategoryFullySelected(category.id, subcategory.id);
                                                    return (
                                                        <div key={subcategory.id} className="space-y-1">
                                                            <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md transition-colors text-sm">
                                                                <button type="button" className="flex items-center gap-2 flex-1 text-left" onClick={() => toggleSubcategory(subcategory.id)}>
                                                                    {expandedSubcategories.includes(subcategory.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                                    <span className="text-muted-foreground">{subcategory.title[language]}</span>
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                        <Package className="w-3 h-3" />{subcategoryLotCount}
                                                                    </span>
                                                                    <span className="flex-1" />
                                                                </button>
                                                                 <label className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"}`} onClick={(e) => { if (disabled) e.preventDefault(); e.stopPropagation(); }}>
                                                                    <Checkbox checked={isSubFullySelected} onCheckedChange={(checked) => { if (disabled) return; if (checked) selectAllInSubcategory(category.id, subcategory.id); else deselectAllInSubcategory(category.id, subcategory.id); }} disabled={disabled} />
                                                                    <span className="text-xs text-muted-foreground">Odaberi sve</span>
                                                                </label>
                                                            </div>
                                                            {(expandedSubcategories.includes(subcategory.id) || formLotSearch.trim()) && (
                                                                <div className="ml-5 space-y-1">
                                                                    {getFilteredProductsBySubcategory(category.id, subcategory.id).map((product) => (
                                                                        <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-md transition-colors">
                                                                            <Checkbox id={`lot-${product.id}`} checked={selectedLots.includes(product.id)} onCheckedChange={() => { if (disabled) return; toggleLot(product.id); }} disabled={disabled} />
                                                                            <img src={product.image} alt={language === "en" ? product.name : product.namesr} className="w-10 h-10 rounded object-cover" />
                                                                            <label htmlFor={`lot-${product.id}`} className={`flex-1 text-sm ${disabled ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"}`}>
                                                                                <span className="font-medium">Lot {product.lot}</span>
                                                                                <span className="text-muted-foreground ml-2">{language === "en" ? product.name : product.namesr}</span>
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {getFilteredProductsWithoutSubcategory(category.id).map((product) => (
                                                     <div key={product.id} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-md transition-colors">
                                                         <Checkbox id={`lot-${product.id}`} checked={selectedLots.includes(product.id)} onCheckedChange={() => { if (disabled) return; toggleLot(product.id); }} disabled={disabled} />
                                                         <img src={product.image} alt={language === "en" ? product.name : product.namesr} className="w-10 h-10 rounded object-cover" />
                                                         <label htmlFor={`lot-${product.id}`} className={`flex-1 text-sm ${disabled ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer"}`}>
                                                             <span className="font-medium">Lot {product.lot}</span>
                                                             <span className="text-muted-foreground ml-2">{language === "en" ? product.name : product.namesr}</span>
                                                         </label>
                                                     </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    );
};

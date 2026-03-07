import React from "react";
import { ChevronDown, ChevronRight, ChevronUp, Search, Package, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Product, Collection, Category } from "@/contexts/DataContext";

export interface CollectionsSectionProps {
    language: "en" | "sr";
    categories: Category[];
    products: Product[];
    collections: Collection[];
    collectionsExpanded: boolean;
    setCollectionsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setLotsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    setStepsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    selectedCollections: number[];
    setSelectedCollections: React.Dispatch<React.SetStateAction<number[]>>;
    collectionSearch: string;
    setCollectionSearch: React.Dispatch<React.SetStateAction<string>>;
    expandedColCategories: string[];
    expandedColSubcategories: string[];
    setExpandedColCategories: React.Dispatch<React.SetStateAction<string[]>>;
    setExpandedColSubcategories: React.Dispatch<React.SetStateAction<string[]>>;
    originalCollectionIds?: Set<number>;
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({
    language,
    categories,
    products,
    collections,
    collectionsExpanded,
    setCollectionsExpanded,
    setLotsExpanded,
    setStepsExpanded,
    selectedCollections,
    setSelectedCollections,
    collectionSearch,
    setCollectionSearch,
    expandedColCategories,
    expandedColSubcategories,
    setExpandedColCategories,
    setExpandedColSubcategories,
    originalCollectionIds,
}) => {
    const toggleColCategory = (catId: string) => {
        setExpandedColCategories(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };
    const toggleColSubcategory = (subId: string) => {
        setExpandedColSubcategories(prev =>
            prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
        );
    };

    const getColImage = (col: Collection) => {
        if (col.image) return col.image;
        if (col.productIds.length > 0) {
            const firstProduct = products.find(p => p.id === col.productIds[0]);
            return firstProduct?.image || firstProduct?.images?.[0] || "";
        }
        return "";
    };

    const availableCollectionsFiltered = collections.filter((c) => {
        const isSelected = selectedCollections.includes(c.id);
        const isOriginal = originalCollectionIds?.has(c.id);
        const isAvailable = c.status === "available" || isSelected || isOriginal;
        if (!isAvailable) return false;
        if (!c.category || c.category.trim() === "") return false;
        if (!collectionSearch.trim()) return true;
        const q = collectionSearch.toLowerCase();
        return (
            c.name.en.toLowerCase().includes(q) ||
            c.name.sr.toLowerCase().includes(q) ||
            c.lotNumber.toLowerCase().includes(q)
        );
    });

    const renderCollection = (col: Collection) => {
        const colImage = getColImage(col);
        return (
            <div key={col.id} className="flex items-center gap-3 p-2 hover:bg-muted/30 rounded-md transition-colors">
                <Checkbox
                    id={`col-${col.id}`}
                    checked={selectedCollections.includes(col.id)}
                    onCheckedChange={() => {
                        setSelectedCollections((prev) =>
                            prev.includes(col.id) ? prev.filter((id) => id !== col.id) : [...prev, col.id]
                        );
                    }}
                />
                {colImage ? (
                    <img src={colImage} alt={col.name[language]} className="w-10 h-10 rounded object-cover border border-border shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center border border-border shrink-0">
                        <Layers className="w-4 h-4 text-muted-foreground" />
                    </div>
                )}
                <label htmlFor={`col-${col.id}`} className="flex-1 cursor-pointer text-sm min-w-0">
                    <span className="font-medium">{col.lotNumber}</span>
                    <span className="text-muted-foreground ml-2 truncate">{col.name[language]}</span>
                </label>
                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Package className="w-3 h-3" />{col.productIds.length}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">€{col.startingPrice.toLocaleString()}</span>
            </div>
        );
    };

    const categoryIds = [...new Set(availableCollectionsFiltered.map(c => c.category))];
    const categoriesWithCollections = categories.filter(cat => categoryIds.includes(cat.id));

    return (
        <div className={`flex flex-col transition-all duration-300 ease-in-out ${collectionsExpanded ? "flex-1 min-h-0" : ""}`}>
            <button
                type="button"
                onClick={() => {
                    setCollectionsExpanded(!collectionsExpanded);
                    if (!collectionsExpanded) { setLotsExpanded(false); setStepsExpanded(false); }
                }}
                className={`flex items-center justify-between w-full p-3 border rounded-md hover:bg-muted/50 transition-all duration-300 cursor-pointer shrink-0 ${collectionsExpanded ? "rounded-b-none border-b-0" : ""}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                        {collectionsExpanded
                            ? language === "en" ? "Available Collections" : "Dostupne Kolekcije"
                            : language === "en" ? "Add Collections" : "Dodaj kolekcije"}
                    </span>
                    {selectedCollections.length > 0 && (
                        <Badge className="bg-secondary text-white">
                            {selectedCollections.length} {language === "en" ? "selected" : "izabrano"}
                        </Badge>
                    )}
                </div>
                <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${collectionsExpanded ? "rotate-0" : "rotate-180"}`} />
            </button>
            <div className={`border border-t-0 rounded-b-md overflow-hidden transition-all duration-300 ease-in-out flex flex-col ${collectionsExpanded ? "flex-1 min-h-0" : "max-h-0 opacity-0"}`}>
                <div className="p-2 border-b border-border shrink-0">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={language === "en" ? "Search collections..." : "Pretraži kolekcije..."}
                            value={collectionSearch}
                            onChange={(e) => setCollectionSearch(e.target.value)}
                            className="pl-8 h-8 text-sm"
                        />
                    </div>
                </div>
                <ScrollArea className={`p-2 flex-1 min-h-0 ${collectionsExpanded ? "" : "h-0"}`}>
                    {categoriesWithCollections.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-3">
                            {language === "en" ? "No available collections" : "Nema dostupnih kolekcija"}
                        </p>
                    ) : (
                        <div className="space-y-1">
                            {categoriesWithCollections.map((category) => {
                                const catCollections = availableCollectionsFiltered.filter(c => c.category === category.id);
                                const catIsExpanded = expandedColCategories.includes(category.id) || !!collectionSearch.trim();
                                const subIdsInCat = [...new Set(catCollections.filter(c => c.subcategory && c.subcategory.trim() !== "").map(c => c.subcategory))];
                                const subcategoriesWithCols = category.subcategories.filter(sub => subIdsInCat.includes(sub.id));
                                const collectionsWithoutSub = catCollections.filter(c => !c.subcategory || c.subcategory.trim() === "" || !category.subcategories.some(s => s.id === c.subcategory));
                                const allCatColIds = catCollections.map(c => c.id);
                                const isCatFullySelected = allCatColIds.length > 0 && allCatColIds.every(id => selectedCollections.includes(id));

                                return (
                                    <div key={category.id} className="space-y-1">
                                        <div className="flex items-center gap-2 p-2 hover:bg-muted rounded-md transition-colors">
                                            <button type="button" className="flex items-center gap-2 flex-1 text-left" onClick={() => toggleColCategory(category.id)}>
                                                {catIsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                <span className="font-medium">{category.title[language]}</span>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3" />{catCollections.length}</span>
                                                <span className="flex-1" />
                                            </button>
                                            <label className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer hover:bg-muted/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox checked={isCatFullySelected} onCheckedChange={(checked) => {
                                                    if (checked) setSelectedCollections(prev => [...new Set([...prev, ...allCatColIds])]);
                                                    else setSelectedCollections(prev => prev.filter(id => !allCatColIds.includes(id)));
                                                }} />
                                                <span className="text-xs text-muted-foreground">{language === "en" ? "Select all" : "Odaberi sve"}</span>
                                            </label>
                                        </div>
                                        {catIsExpanded && (
                                            <div className="ml-6 space-y-1">
                                                {subcategoriesWithCols.map((subcategory) => {
                                                    const subCollections = catCollections.filter(c => c.subcategory === subcategory.id);
                                                    const subIsExpanded = expandedColSubcategories.includes(subcategory.id) || !!collectionSearch.trim();
                                                    const allSubColIds = subCollections.map(c => c.id);
                                                    const isSubFullySelected = allSubColIds.length > 0 && allSubColIds.every(id => selectedCollections.includes(id));
                                                    return (
                                                        <div key={subcategory.id} className="space-y-1">
                                                            <div className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded-md transition-colors text-sm">
                                                                <button type="button" className="flex items-center gap-2 flex-1 text-left" onClick={() => toggleColSubcategory(subcategory.id)}>
                                                                    {subIsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                                    <span className="text-muted-foreground">{subcategory.title[language]}</span>
                                                                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3" />{subCollections.length}</span>
                                                                    <span className="flex-1" />
                                                                </button>
                                                                <label className="flex items-center gap-1.5 px-2 py-1 rounded cursor-pointer hover:bg-muted/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                                                                    <Checkbox checked={isSubFullySelected} onCheckedChange={(checked) => {
                                                                        if (checked) setSelectedCollections(prev => [...new Set([...prev, ...allSubColIds])]);
                                                                        else setSelectedCollections(prev => prev.filter(id => !allSubColIds.includes(id)));
                                                                    }} />
                                                                    <span className="text-xs text-muted-foreground">{language === "en" ? "Select all" : "Odaberi sve"}</span>
                                                                </label>
                                                            </div>
                                                            {subIsExpanded && (
                                                                <div className="ml-5 space-y-1">
                                                                    {subCollections.map(renderCollection)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {collectionsWithoutSub.map(renderCollection)}
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

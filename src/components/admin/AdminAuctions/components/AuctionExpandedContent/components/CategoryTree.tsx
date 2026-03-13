import React from "react";
import type { 
    Category, 
    Subcategory, 
    Lot, 
    Collection, 
    Bid, 
    BidInfo, 
    CategoryStats, 
    Product, 
    Language 
} from "../index";
import { CategoryRow } from "./CategoryRow";
import { SubcategoryRow } from "./SubcategoryRow";
import { ItemList } from "./ItemList";

interface CategoryTreeProps {
    auctionId: number;
    language: Language;
    categories: Category[];
    searchActive: boolean;
    expandedViewCategories: string[];
    expandedViewSubcategories: string[];
    expandKey: (id: string | number, prefix?: string) => string;
    getCategoryStats: (auctionId: number, categoryId: string) => CategoryStats;
    getAuctionSubcategoriesForCategory: (auctionId: number, categoryId: string) => Subcategory[];
    hasMatchingLotsInSubcategory: (auctionId: number, subcategoryId: string) => boolean;
    getSubcategoryStats: (auctionId: number, subcategoryId: string) => CategoryStats;
    getAuctionLotsForSubcategory: (auctionId: number, subcategoryId: string) => Lot[];
    getSubcategoryCollections: (auctionId: number, subcategoryId: string) => Collection[];
    getAuctionLotsWithoutSubcategory: (auctionId: number, categoryId: string) => Lot[];
    getCollectionsWithoutSubcategory: (auctionId: number, categoryId: string) => Collection[];
    toggleViewCategory: (key: string) => void;
    toggleViewSubcategory: (key: string) => void;
    itemListSharedProps: {
        auctionId: number;
        language: Language;
        searchActive: boolean;
        filterLotsBySearch: (lots: Lot[], auctionId: number) => Lot[];
        getLotBidInfo: (id: number, auctionId: number) => BidInfo;
        getCollectionBidInfo: (id: number, auctionId: number) => BidInfo;
        getProductBids: (id: number, auctionId: number) => Bid[];
        expandedViewLots: string[];
        toggleViewLot: (key: string) => void;
        handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
        collectionProducts: Product[];
    };
}

export const CategoryTree: React.FC<CategoryTreeProps> = React.memo(({
    auctionId,
    language,
    categories,
    searchActive,
    expandedViewCategories,
    expandedViewSubcategories,
    expandKey,
    getCategoryStats,
    getAuctionSubcategoriesForCategory,
    hasMatchingLotsInSubcategory,
    getSubcategoryStats,
    getAuctionLotsForSubcategory,
    getSubcategoryCollections,
    getAuctionLotsWithoutSubcategory,
    getCollectionsWithoutSubcategory,
    toggleViewCategory,
    toggleViewSubcategory,
    itemListSharedProps
}) => {
    return (
        <div className="space-y-1">
            {categories.map((category) => {
                const catStats = getCategoryStats(auctionId, category.id);
                const isCatExpanded = searchActive || expandedViewCategories.includes(expandKey(category.id));
                const subcategories = getAuctionSubcategoriesForCategory(auctionId, category.id)
                    .filter((sub) => !searchActive || hasMatchingLotsInSubcategory(auctionId, sub.id));

                return (
                    <CategoryRow
                        key={category.id}
                        category={category}
                        auctionId={auctionId}
                        language={language}
                        isExpanded={isCatExpanded}
                        stats={catStats}
                        onToggle={() => toggleViewCategory(expandKey(category.id))}
                    >
                        {subcategories.map((sub) => {
                            const subStats = getSubcategoryStats(auctionId, sub.id);
                            const isSubExpanded = searchActive || expandedViewSubcategories.includes(expandKey(sub.id));

                            return (
                                <SubcategoryRow
                                    key={sub.id}
                                    subcategory={sub}
                                    auctionId={auctionId}
                                    language={language}
                                    isExpanded={isSubExpanded}
                                    stats={subStats}
                                    onToggle={() => toggleViewSubcategory(expandKey(sub.id))}
                                >
                                    <ItemList
                                        lots={getAuctionLotsForSubcategory(auctionId, sub.id)}
                                        collections={getSubcategoryCollections(auctionId, sub.id)}
                                        {...itemListSharedProps}
                                    />
                                </SubcategoryRow>
                            );
                        })}

                        {/* Lots & collections without subcategory */}
                        <ItemList
                            lots={getAuctionLotsWithoutSubcategory(auctionId, category.id)}
                            collections={getCollectionsWithoutSubcategory(auctionId, category.id)}
                            {...itemListSharedProps}
                        />
                    </CategoryRow>
                );
            })}
        </div>
    );
});

CategoryTree.displayName = "CategoryTree";

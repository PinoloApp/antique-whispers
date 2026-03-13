import React, { useMemo, useCallback } from "react";
import { 
    Category, 
    Subcategory, 
    Lot, 
    Collection, 
    Bid, 
    BidInfo, 
    CategoryStats, 
    Product, 
    Language 
} from "./types";

import { AuctionToolbar } from "./components/AuctionToolbar";
import { CategoryTree } from "./components/CategoryTree";

export interface AuctionExpandedContentProps {
    auction: { id: number };
    language: Language;
    getLotSearchQuery: (id: number) => string;
    setLotSearchQuery: (id: number, query: string) => void;
    collapseAllForAuction: (id: number) => void;
    expandAllForAuction: (id: number) => void;
    isSearchActive: (id: number) => boolean;
    hasMatchingLotsInCategory: (auctionId: number, categoryId: string) => boolean;
    hasMatchingLotsInSubcategory: (auctionId: number, subcategoryId: string) => boolean;
    getAuctionCategories: (id: number) => Category[];
    getCategoryStats: (auctionId: number, categoryId: string) => CategoryStats;
    getSubcategoryStats: (auctionId: number, subcategoryId: string) => CategoryStats;
    getAuctionSubcategoriesForCategory: (auctionId: number, categoryId: string) => Subcategory[];
    filterLotsBySearch: (lots: Lot[], auctionId: number) => Lot[];
    getAuctionLotsForSubcategory: (auctionId: number, subcategoryId: string) => Lot[];
    getAuctionLotsWithoutSubcategory: (auctionId: number, categoryId: string) => Lot[];
    getSubcategoryCollections: (auctionId: number, subcategoryId: string) => Collection[];
    getCollectionsWithoutSubcategory: (auctionId: number, categoryId: string) => Collection[];
    getLotBidInfo: (id: number, auctionId: number) => BidInfo;
    getCollectionBidInfo: (id: number, auctionId: number) => BidInfo;
    getProductBids: (id: number, auctionId: number) => Bid[];
    toggleViewCategory: (key: string) => void;
    toggleViewSubcategory: (key: string) => void;
    toggleViewLot: (key: string) => void;
    expandedViewCategories: string[];
    expandedViewSubcategories: string[];
    expandedViewLots: string[];
    handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
    collectionProducts: Product[];
}

export const AuctionExpandedContent: React.FC<AuctionExpandedContentProps> = React.memo(({
    auction,
    language,
    getLotSearchQuery,
    setLotSearchQuery,
    collapseAllForAuction,
    expandAllForAuction,
    isSearchActive,
    hasMatchingLotsInCategory,
    hasMatchingLotsInSubcategory,
    getAuctionCategories,
    getCategoryStats,
    getSubcategoryStats,
    getAuctionSubcategoriesForCategory,
    filterLotsBySearch,
    getAuctionLotsForSubcategory,
    getAuctionLotsWithoutSubcategory,
    getSubcategoryCollections,
    getCollectionsWithoutSubcategory,
    getLotBidInfo,
    getCollectionBidInfo,
    getProductBids,
    toggleViewCategory,
    toggleViewSubcategory,
    toggleViewLot,
    expandedViewCategories,
    expandedViewSubcategories,
    expandedViewLots,
    handleOpenAddBidDialog,
    collectionProducts,
}) => {
    const { id: auctionId } = auction;
    const searchActive = isSearchActive(auctionId);
    
    // Memoized translation helper
    const t = useCallback((en: string, sr: string) => language === "en" ? en : sr, [language]);
    
    // Expand/Collapse key helper
    const expandKey = useCallback((id: string | number, prefix = "") => `${prefix}${auctionId}-${id}`, [auctionId]);

    // Memoize static-ish derived data
    const categories = useMemo(
        () => getAuctionCategories(auctionId).filter(
            (cat) => !searchActive || hasMatchingLotsInCategory(auctionId, cat.id)
        ),
        [auctionId, searchActive, getAuctionCategories, hasMatchingLotsInCategory]
    );

    const onSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setLotSearchQuery(auctionId, e.target.value),
        [auctionId, setLotSearchQuery]
    );

    // Shared props passed down to ItemList instances — avoids prop drilling repetition
    const itemListSharedProps = {
        auctionId, language, searchActive, filterLotsBySearch,
        getLotBidInfo, getCollectionBidInfo, getProductBids,
        expandedViewLots, toggleViewLot, handleOpenAddBidDialog, collectionProducts,
    };

    return (
        <div className="space-y-4">
            <AuctionToolbar
                auctionId={auctionId}
                language={language}
                getLotSearchQuery={getLotSearchQuery}
                onSearchChange={onSearchChange}
                collapseAllForAuction={collapseAllForAuction}
                expandAllForAuction={expandAllForAuction}
                t={t}
            />

            <CategoryTree
                auctionId={auctionId}
                language={language}
                categories={categories}
                searchActive={searchActive}
                expandedViewCategories={expandedViewCategories}
                expandedViewSubcategories={expandedViewSubcategories}
                expandKey={expandKey}
                getCategoryStats={getCategoryStats}
                getAuctionSubcategoriesForCategory={getAuctionSubcategoriesForCategory}
                hasMatchingLotsInSubcategory={hasMatchingLotsInSubcategory}
                getSubcategoryStats={getSubcategoryStats}
                getAuctionLotsForSubcategory={getAuctionLotsForSubcategory}
                getSubcategoryCollections={getSubcategoryCollections}
                getAuctionLotsWithoutSubcategory={getAuctionLotsWithoutSubcategory}
                getCollectionsWithoutSubcategory={getCollectionsWithoutSubcategory}
                toggleViewCategory={toggleViewCategory}
                toggleViewSubcategory={toggleViewSubcategory}
                itemListSharedProps={itemListSharedProps}
            />
        </div>
    );
});

AuctionExpandedContent.displayName = "AuctionExpandedContent";

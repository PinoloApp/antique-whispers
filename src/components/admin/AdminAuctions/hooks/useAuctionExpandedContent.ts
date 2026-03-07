import { useState } from "react";
import { Auction, Product, Collection, Bid, Category } from "@/contexts/DataContext";

interface UseAuctionExpandedContentProps {
    language: "en" | "sr";
    auctions: Auction[];
    products: Product[];
    collections: Collection[];
    collectionProducts: Product[];
    categories: Category[];
    getProductBids: (productId: number, auctionId: number) => Bid[];
    handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
}

export const useAuctionExpandedContent = ({
    language,
    auctions,
    products,
    collections,
    collectionProducts,
    categories,
    getProductBids,
    handleOpenAddBidDialog
}: UseAuctionExpandedContentProps) => {
    const [expandedAuctionIds, setExpandedAuctionIds] = useState<number[]>([]);
    const [expandedViewCategories, setExpandedViewCategories] = useState<string[]>([]);
    const [expandedViewSubcategories, setExpandedViewSubcategories] = useState<string[]>([]);
    const [expandedViewLots, setExpandedViewLots] = useState<string[]>([]);
    const [lotSearchQueries, setLotSearchQueries] = useState<Record<number, string>>({});

    const getLotSearchQuery = (auctionId: number) => lotSearchQueries[auctionId] || "";

    const setLotSearchQuery = (auctionId: number, query: string) => {
        setLotSearchQueries((prev) => ({ ...prev, [auctionId]: query }));
    };

    const isLotMatchingSearch = (lot: Product, auctionId: number) => {
        const query = getLotSearchQuery(auctionId).toLowerCase().trim();
        if (!query) return false;

        const cleanedQuery = query.replace(/^lot\s*/i, "").trim();
        const queryWithoutLeadingZeros = cleanedQuery.replace(/^0+/, "");
        const lotNumberWithoutLeadingZeros = lot.lot?.replace(/^0+/, "") || "";

        return (
            lot.lot?.toLowerCase().includes(query) ||
            lot.lot?.toLowerCase().includes(cleanedQuery) ||
            lotNumberWithoutLeadingZeros.includes(queryWithoutLeadingZeros) ||
            `lot ${lot.lot}`.toLowerCase().includes(query) ||
            `lot${lot.lot}`.toLowerCase().includes(query) ||
            lot.name.toLowerCase().includes(query) ||
            lot.namesr.toLowerCase().includes(query) ||
            lot.catalogMark?.toLowerCase().includes(query)
        );
    };

    const filterLotsBySearch = (lots: Product[], auctionId: number) => {
        const query = getLotSearchQuery(auctionId).toLowerCase().trim();
        if (!query) return lots;
        return lots.filter((lot) => isLotMatchingSearch(lot, auctionId));
    };

    const hasMatchingLotsInSubcategory = (auctionId: number, subcategoryId: string) => {
        const query = getLotSearchQuery(auctionId).toLowerCase().trim();
        if (!query) return true;
        const lots = getAuctionLotsForSubcategory(auctionId, subcategoryId);
        return lots.some((lot) => isLotMatchingSearch(lot, auctionId));
    };

    const hasMatchingLotsInCategory = (auctionId: number, categoryId: string) => {
        const query = getLotSearchQuery(auctionId).toLowerCase().trim();
        if (!query) return true;
        const lots = getAuctionLots(auctionId).filter((lot) => lot.category === categoryId);
        return lots.some((lot) => isLotMatchingSearch(lot, auctionId));
    };

    const isSearchActive = (auctionId: number) => {
        return getLotSearchQuery(auctionId).trim().length > 0;
    };

    const toggleAuctionExpand = (auctionId: number) => {
        setExpandedAuctionIds((prev) =>
            prev.includes(auctionId) ? prev.filter((id) => id !== auctionId) : [...prev, auctionId],
        );
    };

    const toggleViewCategory = (categoryId: string) => {
        setExpandedViewCategories((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
        );
    };

    const toggleViewSubcategory = (subcategoryId: string) => {
        setExpandedViewSubcategories((prev) =>
            prev.includes(subcategoryId) ? prev.filter((id) => id !== subcategoryId) : [...prev, subcategoryId],
        );
    };

    const toggleViewLot = (lotKey: string) => {
        setExpandedViewLots((prev) => (prev.includes(lotKey) ? prev.filter((id) => id !== lotKey) : [...prev, lotKey]));
    };

    const expandAllForAuction = (auctionId: number) => {
        const auctionCategories = getAuctionCategories(auctionId);
        const categoryKeys = auctionCategories.map((cat) => `${auctionId}-${cat.id}`);
        const allSubcategoryKeys: string[] = [];
        const allLotKeys: string[] = [];

        auctionCategories.forEach((category) => {
            const subcategories = getAuctionSubcategoriesForCategory(auctionId, category.id);
            subcategories.forEach((sub) => {
                allSubcategoryKeys.push(`${auctionId}-${sub.id}`);
                const lots = getAuctionLotsForSubcategory(auctionId, sub.id);
                lots.forEach((lot) => {
                    allLotKeys.push(`${auctionId}-${lot.id}`);
                });
            });
            const lotsWithoutSub = getAuctionLotsWithoutSubcategory(auctionId, category.id);
            lotsWithoutSub.forEach((lot) => {
                allLotKeys.push(`${auctionId}-${lot.id}`);
            });
        });

        setExpandedViewCategories((prev) => [...new Set([...prev, ...categoryKeys])]);
        setExpandedViewSubcategories((prev) => [...new Set([...prev, ...allSubcategoryKeys])]);
        setExpandedViewLots((prev) => [...new Set([...prev, ...allLotKeys])]);
    };

    const collapseAllForAuction = (auctionId: number) => {
        const auctionCategories = getAuctionCategories(auctionId);
        const categoryKeys = auctionCategories.map((cat) => `${auctionId}-${cat.id}`);
        const allSubcategoryKeys: string[] = [];
        const allLotKeys: string[] = [];

        auctionCategories.forEach((category) => {
            const subcategories = getAuctionSubcategoriesForCategory(auctionId, category.id);
            subcategories.forEach((sub) => {
                allSubcategoryKeys.push(`${auctionId}-${sub.id}`);
                const lots = getAuctionLotsForSubcategory(auctionId, sub.id);
                lots.forEach((lot) => {
                    allLotKeys.push(`${auctionId}-${lot.id}`);
                });
            });
            const lotsWithoutSub = getAuctionLotsWithoutSubcategory(auctionId, category.id);
            lotsWithoutSub.forEach((lot) => {
                allLotKeys.push(`${auctionId}-${lot.id}`);
            });
        });

        setExpandedViewCategories((prev) => prev.filter((id) => !categoryKeys.includes(id)));
        setExpandedViewSubcategories((prev) => prev.filter((id) => !allSubcategoryKeys.includes(id)));
        setExpandedViewLots((prev) => prev.filter((id) => !allLotKeys.includes(id)));
    };

    const isAllExpandedForAuction = (auctionId: number) => {
        const auctionCategories = getAuctionCategories(auctionId);
        if (auctionCategories.length === 0) return false;
        const categoryKeys = auctionCategories.map((cat) => `${auctionId}-${cat.id}`);
        return categoryKeys.every((key) => expandedViewCategories.includes(key));
    };

    const getAuctionLots = (auctionId: number) => {
        const auction = auctions.find((a) => a.id === auctionId);
        if (!auction) return [];
        return products.filter((p) => auction.lotIds?.includes(p.id));
    };

    const getAuctionCollections = (auctionId: number) => {
        const auction = auctions.find((a) => a.id === auctionId);
        if (!auction) return [];
        return collections.filter((c) => auction.collectionIds?.includes(c.id));
    };

    const getCategoryCollections = (auctionId: number, categoryId: string) => {
        return getAuctionCollections(auctionId).filter((c) => c.category === categoryId);
    };

    const getSubcategoryCollections = (auctionId: number, subcategoryId: string) => {
        return getAuctionCollections(auctionId).filter((c) => c.subcategory === subcategoryId);
    };

    const getCollectionsWithoutSubcategory = (auctionId: number, categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        const validSubcategoryIds = new Set(category?.subcategories.map((s) => s.id) ?? []);
        return getAuctionCollections(auctionId).filter(
            (c) =>
                c.category === categoryId &&
                (!c.subcategory || c.subcategory === "" || !validSubcategoryIds.has(c.subcategory)),
        );
    };

    const getAuctionCategories = (auctionId: number) => {
        const lots = getAuctionLots(auctionId);
        const lotCategoryIds = new Set(lots.map((lot) => lot.category));
        const colCategoryIds = new Set(getAuctionCollections(auctionId).map((c) => c.category));
        const allCategoryIds = [...new Set([...lotCategoryIds, ...colCategoryIds])];
        return categories.filter((cat) => allCategoryIds.includes(cat.id));
    };

    const getAuctionSubcategoriesForCategory = (auctionId: number, categoryId: string) => {
        const lots = getAuctionLots(auctionId);
        const categoryLots = lots.filter((lot) => lot.category === categoryId);
        const lotSubIds = new Set(categoryLots.map((lot) => lot.subcategory));
        const colSubIds = new Set(getCategoryCollections(auctionId, categoryId).map((c) => c.subcategory));
        const allSubIds = new Set([...lotSubIds, ...colSubIds]);
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return [];
        return category.subcategories.filter((sub) => allSubIds.has(sub.id));
    };

    const getAuctionLotsForSubcategory = (auctionId: number, subcategoryId: string) => {
        const lots = getAuctionLots(auctionId);
        return lots.filter((lot) => lot.subcategory === subcategoryId);
    };

    const getAuctionLotsWithoutSubcategory = (auctionId: number, categoryId: string) => {
        const lots = getAuctionLots(auctionId);
        const category = categories.find((c) => c.id === categoryId);
        const validSubcategoryIds = new Set(category?.subcategories.map((s) => s.id) ?? []);
        return lots.filter(
            (lot) =>
                lot.category === categoryId &&
                (!lot.subcategory || lot.subcategory === "" || !validSubcategoryIds.has(lot.subcategory)),
        );
    };

    const getCollectionBidInfo = (collectionId: number, auctionId: number) => {
        const colBids = getProductBids(collectionId, auctionId);
        const winningBid = colBids.find((b) => b.isWinning);
        return {
            totalBids: colBids.length,
            highestBid: winningBid?.currentAmount || 0,
            bidderName: winningBid?.bidderName || null,
        };
    };

    const getLotBidInfo = (productId: number, auctionId: number) => {
        const productBids = getProductBids(productId, auctionId);
        const winningBid = productBids.find((b) => b.isWinning);
        return {
            totalBids: productBids.length,
            highestBid: winningBid?.currentAmount || 0,
            bidderName: winningBid?.bidderName || null,
        };
    };

    const getCategoryStats = (auctionId: number, categoryId: string) => {
        const lots = getAuctionLots(auctionId).filter((lot) => lot.category === categoryId);
        const cols = getCategoryCollections(auctionId, categoryId);
        const totalBids =
            lots.reduce((acc, lot) => acc + getProductBids(lot.id, auctionId).length, 0) +
            cols.reduce((acc, col) => acc + getProductBids(col.id, auctionId).length, 0);
        const lotsWithBids = lots.filter((lot) => getProductBids(lot.id, auctionId).length > 0).length;
        return { totalLots: lots.length, totalCollections: cols.length, totalBids, lotsWithBids };
    };

    const getSubcategoryStats = (auctionId: number, subcategoryId: string) => {
        const lots = getAuctionLotsForSubcategory(auctionId, subcategoryId);
        const cols = getSubcategoryCollections(auctionId, subcategoryId);
        const totalBids =
            lots.reduce((acc, lot) => acc + getProductBids(lot.id, auctionId).length, 0) +
            cols.reduce((acc, col) => acc + getProductBids(col.id, auctionId).length, 0);
        const lotsWithBids = lots.filter((lot) => getProductBids(lot.id, auctionId).length > 0).length;
        return { totalLots: lots.length, totalCollections: cols.length, totalBids, lotsWithBids };
    };

    const getAuctionTotalBids = (auctionId: number) => {
        const lots = getAuctionLots(auctionId);
        const cols = getAuctionCollections(auctionId);
        return (
            lots.reduce((total, lot) => total + getProductBids(lot.id, auctionId).length, 0) +
            cols.reduce((total, col) => total + getProductBids(col.id, auctionId).length, 0)
        );
    };

    const getAuctionLotsWithBids = (auctionId: number) => {
        const lots = getAuctionLots(auctionId);
        return lots.filter((lot) => getProductBids(lot.id, auctionId).length > 0).length;
    };

    const expandedContentProps = {
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
    };

    return {
        expandedAuctionIds,
        setExpandedAuctionIds,
        toggleAuctionExpand,
        getAuctionTotalBids,
        getAuctionLots,
        getAuctionCategories,
        getAuctionLotsWithBids,
        expandedContentProps
    };
};

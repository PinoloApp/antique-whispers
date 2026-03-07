import { Auction, Product, Collection } from "@/contexts/DataContext";

export const isCategoryInActiveAuction = (categoryId: string, auctions: Auction[], products: Product[], collections: Collection[]): boolean => {
    const activeAuctions = auctions.filter((a) => a.status === "active" || a.status === "upcoming");
    for (const auction of activeAuctions) {
        // Check lots
        const auctionProducts = products.filter((p) => auction.lotIds.includes(Number(p.id)));
        if (auctionProducts.some((p) => p.category === categoryId)) {
            return true;
        }
        // Check collections
        const auctionCollections = collections.filter((c) => auction.collectionIds.includes(Number(c.id)));
        if (auctionCollections.some((c) => c.category === categoryId)) {
            return true;
        }
    }
    return false;
};

export const isSubcategoryInActiveAuction = (categoryId: string, subcategoryId: string, auctions: Auction[], products: Product[], collections: Collection[]): boolean => {
    const activeAuctions = auctions.filter((a) => a.status === "active" || a.status === "upcoming");
    for (const auction of activeAuctions) {
        // Check lots
        const auctionProducts = products.filter((p) => auction.lotIds.includes(Number(p.id)));
        if (auctionProducts.some((p) => p.category === categoryId && p.subcategory === subcategoryId)) {
            return true;
        }
        // Check collections
        const auctionCollections = collections.filter((c) => auction.collectionIds.includes(Number(c.id)));
        if (auctionCollections.some((c) => c.category === categoryId && c.subcategory === subcategoryId)) {
            return true;
        }
    }
    return false;
};

export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

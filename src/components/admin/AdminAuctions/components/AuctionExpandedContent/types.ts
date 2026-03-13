export type Language = "en" | "sr";

export interface Bid {
    id: number;
    bidderName: string;
    bidderEmail: string;
    currentAmount: number;
    maxAmount: number;
    timestamp: string;
    isWinning: boolean;
    isLiveAuction: boolean;
}

export interface BidInfo {
    totalBids: number;
    highestBid: number;
}

export interface Lot {
    id: number;
    lot: string;
    name: string;
    namesr: string;
    image: string;
    startingPrice?: number;
    currentBid: number;
}

export interface Collection {
    id: number;
    lotNumber: string;
    name: Record<Language, string>;
    image?: string;
    productIds?: number[];
    startingPrice: number;
}

export interface Category {
    id: string;
    title: Record<Language, string>;
}

export interface Subcategory {
    id: string;
    title: Record<Language, string>;
}

export interface CategoryStats {
    totalLots: number;
    totalCollections: number;
    totalBids: number;
}

export interface Product {
    id: number;
    image?: string;
    images?: string[];
}

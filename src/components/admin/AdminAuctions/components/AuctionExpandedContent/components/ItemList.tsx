import React from "react";
import { Lot, Collection, Language, BidInfo, Bid, Product } from "../types";
import { LotItem } from "./LotItem";
import { CollectionItem } from "./CollectionItem";

interface ItemListProps {
    lots: Lot[];
    collections: Collection[];
    auctionId: number;
    language: Language;
    searchActive: boolean;
    filterLotsBySearch: (lots: Lot[], auctionId: number) => Lot[];
    getLotBidInfo: (id: number, auctionId: number) => BidInfo;
    getCollectionBidInfo: (id: number, auctionId: number) => BidInfo;
    getProductBids: (id: number, auctionId: number) => Bid[];
    expandedViewLots: string[];
    toggleViewLot: (key: string) => void;
    handleOpenAddBidDialog: (id: number, auctionId: number) => void;
    collectionProducts: Product[];
}

export const ItemList: React.FC<ItemListProps> = React.memo(({ 
    lots, 
    collections, 
    auctionId, 
    language, 
    searchActive, 
    filterLotsBySearch,
    getLotBidInfo, 
    getCollectionBidInfo, 
    getProductBids, 
    expandedViewLots,
    toggleViewLot, 
    handleOpenAddBidDialog, 
    collectionProducts 
}) => {
    const expandKey = (id: string | number, prefix = "") => `${prefix}${auctionId}-${id}`;

    return (
        <>
            {filterLotsBySearch(lots, auctionId).map((lot) => (
                <LotItem
                    key={lot.id}
                    lot={lot}
                    auctionId={auctionId}
                    language={language}
                    getLotBidInfo={getLotBidInfo}
                    getProductBids={getProductBids}
                    isLotExpanded={expandedViewLots.includes(expandKey(lot.id))}
                    toggleViewLot={toggleViewLot}
                    isHighlighted={searchActive}
                    handleOpenAddBidDialog={handleOpenAddBidDialog}
                />
            ))}
            {collections.map((col) => (
                <CollectionItem
                    key={col.id}
                    col={col}
                    auctionId={auctionId}
                    language={language}
                    getCollectionBidInfo={getCollectionBidInfo}
                    getProductBids={getProductBids}
                    isColExpanded={expandedViewLots.includes(expandKey(col.id, "col-"))}
                    toggleViewLot={toggleViewLot}
                    handleOpenAddBidDialog={handleOpenAddBidDialog}
                    collectionProducts={collectionProducts}
                />
            ))}
        </>
    );
});

ItemList.displayName = "ItemList";

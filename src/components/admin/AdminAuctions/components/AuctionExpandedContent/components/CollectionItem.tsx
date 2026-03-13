import React, { useMemo } from "react";
import { Package, Gavel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collection, Language, BidInfo, Bid, Product } from "../types";
import { ExpandChevron } from "./ExpandChevron";
import { StatPill } from "./StatPill";
import { LiveBidButton } from "./LiveBidButton";
import { PriceDisplay } from "./PriceDisplay";
import { BidHistoryPanel } from "./BidHistoryPanel";

interface CollectionItemProps {
    col: Collection;
    auctionId: number;
    language: Language;
    getCollectionBidInfo: (id: number, auctionId: number) => BidInfo;
    getProductBids: (id: number, auctionId: number) => Bid[];
    isColExpanded: boolean;
    toggleViewLot: (key: string) => void;
    handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
    collectionProducts: Product[];
}

const resolveCollectionThumbnail = (col: Collection, products: Product[]): string => {
    if (col.image) return col.image;
    const firstProduct = products.find(p => p.id === col.productIds?.[0]);
    return firstProduct?.image ?? firstProduct?.images?.[0] ?? "";
};

export const CollectionItem: React.FC<CollectionItemProps> = React.memo(({
    col, auctionId, language, getCollectionBidInfo, getProductBids,
    isColExpanded, toggleViewLot, handleOpenAddBidDialog, collectionProducts,
}) => {
    const bidInfo = getCollectionBidInfo(col.id, auctionId);
    const bids = getProductBids(col.id, auctionId);
    const key = `col-${auctionId}-${col.id}`;
    const thumbnail = useMemo(
        () => resolveCollectionThumbnail(col, collectionProducts),
        [col, collectionProducts]
    );
    const t = (en: string, sr: string) => language === "en" ? en : sr;

    return (
        <div className="space-y-1">
            <button
                type="button"
                className="flex items-center gap-3 w-full p-2 rounded-md border bg-background border-border hover:bg-muted/30 transition-colors text-left"
                onClick={() => toggleViewLot(key)}
            >
                <ExpandChevron isExpanded={isColExpanded} size="sm" />
                {thumbnail
                    ? <img src={thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                    : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Package className="w-4 h-4 text-muted-foreground" />
                    </div>
                }
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium truncate">
                        {col.lotNumber}: {col.name[language]}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                        {t("Collection", "Kolekcija")}
                    </Badge>
                    <StatPill icon={Gavel} count={bidInfo.totalBids} />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <LiveBidButton
                        id={col.id} auctionId={auctionId} language={language}
                        variant="icon" handleOpenAddBidDialog={handleOpenAddBidDialog}
                    />
                    <PriceDisplay
                        startingPrice={col.startingPrice}
                        bidInfo={bidInfo}
                        language={language}
                    />
                </div>
            </button>

            {isColExpanded && (
                <BidHistoryPanel
                    id={col.id} auctionId={auctionId} bids={bids}
                    language={language} handleOpenAddBidDialog={handleOpenAddBidDialog}
                />
            )}
        </div>
    );
});

CollectionItem.displayName = "CollectionItem";

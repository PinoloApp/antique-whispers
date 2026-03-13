import React from "react";
import { Gavel } from "lucide-react";
import { Lot, Language, BidInfo, Bid } from "../types";
import { ExpandChevron } from "./ExpandChevron";
import { StatPill } from "./StatPill";
import { LiveBidButton } from "./LiveBidButton";
import { PriceDisplay } from "./PriceDisplay";
import { BidHistoryPanel } from "./BidHistoryPanel";

interface LotItemProps {
    lot: Lot;
    auctionId: number;
    language: Language;
    getLotBidInfo: (id: number, auctionId: number) => BidInfo;
    getProductBids: (id: number, auctionId: number) => Bid[];
    isLotExpanded: boolean;
    toggleViewLot: (key: string) => void;
    isHighlighted: boolean;
    handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
}

export const LotItem: React.FC<LotItemProps> = React.memo(({
    lot, auctionId, language, getLotBidInfo, getProductBids,
    isLotExpanded, toggleViewLot, isHighlighted, handleOpenAddBidDialog,
}) => {
    const bidInfo = getLotBidInfo(lot.id, auctionId);
    const bids = getProductBids(lot.id, auctionId);
    const key = `${auctionId}-${lot.id}`;
    const startingPrice = lot.startingPrice ?? lot.currentBid;

    return (
        <div className="space-y-1">
            <button
                type="button"
                className={`flex items-center gap-3 w-full p-2 rounded-md border transition-colors text-left ${isHighlighted
                        ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30"
                        : "bg-background border-border hover:bg-muted/30"
                    }`}
                onClick={() => toggleViewLot(key)}
            >
                <ExpandChevron isExpanded={isLotExpanded} size="sm" />
                <img src={lot.image} alt="" className="w-10 h-10 rounded object-cover" />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium truncate">
                        Lot {lot.lot}: {language === "en" ? lot.name : lot.namesr}
                    </span>
                    <StatPill icon={Gavel} count={bidInfo.totalBids} />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <LiveBidButton
                        id={lot.id} auctionId={auctionId} language={language}
                        variant="icon" handleOpenAddBidDialog={handleOpenAddBidDialog}
                    />
                    <PriceDisplay
                        startingPrice={startingPrice}
                        bidInfo={bidInfo}
                        language={language}
                    />
                </div>
            </button>

            {isLotExpanded && (
                <BidHistoryPanel
                    id={lot.id} auctionId={auctionId} bids={bids}
                    language={language} handleOpenAddBidDialog={handleOpenAddBidDialog}
                />
            )}
        </div>
    );
});

LotItem.displayName = "LotItem";

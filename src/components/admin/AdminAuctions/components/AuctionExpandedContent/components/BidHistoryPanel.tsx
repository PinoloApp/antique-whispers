import React from "react";
import { Bid, Language } from "../types";
import { LiveBidButton } from "./LiveBidButton";
import { BidTable } from "./BidTable";

interface BidHistoryPanelProps {
    id: number;
    auctionId: number;
    bids: Bid[];
    language: Language;
    handleOpenAddBidDialog: (id: number, auctionId: number) => void;
}

export const BidHistoryPanel: React.FC<BidHistoryPanelProps> = React.memo(({ 
    id, 
    auctionId, 
    bids, 
    language, 
    handleOpenAddBidDialog 
}) => {
    const t = (en: string, sr: string) => language === "en" ? en : sr;

    return (
        <div className="ml-6 p-3 bg-muted/30 rounded-md border border-border/50">
            <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-foreground">
                    {t("Bid History", "Istorija Ponuda")}
                </div>
                <LiveBidButton
                    id={id}
                    auctionId={auctionId}
                    language={language}
                    variant="label"
                    handleOpenAddBidDialog={handleOpenAddBidDialog}
                />
            </div>
            <BidTable bids={bids} language={language} />
        </div>
    );
});

BidHistoryPanel.displayName = "BidHistoryPanel";

import React from "react";
import type { Language, BidInfo } from "../index";

interface PriceDisplayProps {
    startingPrice: number;
    bidInfo: BidInfo;
    language: Language;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = React.memo(({ 
    startingPrice, 
    bidInfo, 
    language 
}) => {
    const t = (en: string, sr: string) => language === "en" ? en : sr;
    
    return (
        <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
                <div className="text-sm text-muted-foreground">€{startingPrice.toLocaleString()}</div>
                <div className="text-[10px] text-muted-foreground">{t("Starting", "Početna")}</div>
            </div>
            {bidInfo.totalBids > 0 && (
                <>
                    <span className="text-muted-foreground">–</span>
                    <div className="text-right">
                        <div className="font-medium text-green-600">€{bidInfo.highestBid.toLocaleString()}</div>
                        <div className="text-[10px] text-muted-foreground">{t("Current", "Trenutna")}</div>
                    </div>
                </>
            )}
        </div>
    );
});

PriceDisplay.displayName = "PriceDisplay";

import React from "react";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Language } from "../index";

interface LiveBidButtonProps {
    id: number;
    auctionId: number;
    language: Language;
    variant: "icon" | "label";
    handleOpenAddBidDialog: (id: number, auctionId: number) => void;
}

export const LiveBidButton: React.FC<LiveBidButtonProps> = React.memo(({ 
    id, 
    auctionId, 
    language, 
    variant, 
    handleOpenAddBidDialog 
}) => {
    const t = (en: string, sr: string) => language === "en" ? en : sr;
    const label = t("Add Live Bid", "Dodaj Live Ponudu");
    
    const onClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleOpenAddBidDialog(id, auctionId);
    };

    if (variant === "icon") {
        return (
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 shrink-0"
                title={label}
                onClick={onClick}
            >
                <Radio className="w-4 h-4" />
            </Button>
        );
    }

    return (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onClick}>
            <Radio className="w-3 h-3" />
            {label}
        </Button>
    );
});

LiveBidButton.displayName = "LiveBidButton";

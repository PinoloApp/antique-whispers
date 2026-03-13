import React from "react";
import { Search, ChevronsDownUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Language } from "../index";

interface AuctionToolbarProps {
    auctionId: number;
    language: Language;
    getLotSearchQuery: (id: number) => string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    collapseAllForAuction: (id: number) => void;
    expandAllForAuction: (id: number) => void;
    t: (en: string, sr: string) => string;
}

export const AuctionToolbar: React.FC<AuctionToolbarProps> = React.memo(({
    auctionId,
    language,
    getLotSearchQuery,
    onSearchChange,
    collapseAllForAuction,
    expandAllForAuction,
    t
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={t("Search lots by number or name...", "Pretraži lotove po broju ili nazivu...")}
                    value={getLotSearchQuery(auctionId)}
                    onChange={onSearchChange}
                    className="pl-9"
                />
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline" size="sm"
                    className="hover:bg-transparent hover:text-foreground"
                    onClick={() => collapseAllForAuction(auctionId)}
                >
                    <ChevronsDownUp className="w-4 h-4 mr-1" />
                    {t("Collapse All", "Skupi Sve")}
                </Button>
                <Button
                    variant="outline" size="sm"
                    className="hover:bg-transparent hover:text-foreground"
                    onClick={() => expandAllForAuction(auctionId)}
                >
                    <ChevronsUpDown className="w-4 h-4 mr-1" />
                    {t("Expand All", "Proširi Sve")}
                </Button>
            </div>
        </div>
    );
});

AuctionToolbar.displayName = "AuctionToolbar";

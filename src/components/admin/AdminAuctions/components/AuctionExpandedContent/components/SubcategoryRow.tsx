import React from "react";
import { Package, Layers, Gavel } from "lucide-react";
import { Subcategory, Language, CategoryStats } from "../types";
import { ExpandChevron } from "./ExpandChevron";
import { StatPill } from "./StatPill";

interface SubcategoryRowProps {
    subcategory: Subcategory;
    auctionId: number;
    language: Language;
    isExpanded: boolean;
    stats: CategoryStats;
    onToggle: () => void;
    children: React.ReactNode;
}

export const SubcategoryRow: React.FC<SubcategoryRowProps> = React.memo(({ 
    subcategory, 
    language, 
    isExpanded, 
    stats, 
    onToggle, 
    children 
}) => (
    <div className="space-y-1">
        <button
            type="button"
            className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-md transition-colors text-left text-sm"
            onClick={onToggle}
        >
            <ExpandChevron isExpanded={isExpanded} size="sm" />
            <span className="text-muted-foreground">{subcategory.title[language]}</span>
            <StatPill icon={Package} count={stats.totalLots} />
            {stats.totalCollections > 0 && <StatPill icon={Layers} count={stats.totalCollections} />}
            <StatPill icon={Gavel} count={stats.totalBids} />
            <span className="flex-1" />
        </button>
        {isExpanded && <div className="ml-5 mt-2 space-y-1">{children}</div>}
    </div>
));

SubcategoryRow.displayName = "SubcategoryRow";

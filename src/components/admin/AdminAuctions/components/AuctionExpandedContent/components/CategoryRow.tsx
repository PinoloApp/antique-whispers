import React from "react";
import { Package, Layers, Gavel } from "lucide-react";
import { Category, Language, CategoryStats } from "../types";
import { ExpandChevron } from "./ExpandChevron";
import { StatPill } from "./StatPill";

interface CategoryRowProps {
    category: Category;
    auctionId: number;
    language: Language;
    isExpanded: boolean;
    stats: CategoryStats;
    onToggle: () => void;
    children: React.ReactNode;
}

export const CategoryRow: React.FC<CategoryRowProps> = React.memo(({ 
    category, 
    language, 
    isExpanded, 
    stats, 
    onToggle, 
    children 
}) => (
    <div className="space-y-1">
        <button
            type="button"
            className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md transition-colors text-left"
            onClick={onToggle}
        >
            <ExpandChevron isExpanded={isExpanded} />
            <span className="font-medium">{category.title[language]}</span>
            <StatPill icon={Package} count={stats.totalLots} />
            {stats.totalCollections > 0 && <StatPill icon={Layers} count={stats.totalCollections} />}
            <StatPill icon={Gavel} count={stats.totalBids} />
            <span className="flex-1" />
        </button>
        {isExpanded && <div className="ml-6 space-y-1">{children}</div>}
    </div>
));

CategoryRow.displayName = "CategoryRow";

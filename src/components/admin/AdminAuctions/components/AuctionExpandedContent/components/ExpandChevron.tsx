import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExpandChevronProps {
    isExpanded: boolean;
    size?: "sm" | "md";
}

export const ExpandChevron: React.FC<ExpandChevronProps> = React.memo(({
    isExpanded,
    size = "md",
}) => {
    const cls = size === "sm" ? "w-3 h-3 shrink-0" : "w-4 h-4 shrink-0";
    return isExpanded
        ? <ChevronDown className={cls} />
        : <ChevronRight className={cls} />;
});

ExpandChevron.displayName = "ExpandChevron";

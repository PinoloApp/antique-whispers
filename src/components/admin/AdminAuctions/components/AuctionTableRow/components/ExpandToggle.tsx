import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExpandToggleProps {
    isExpanded: boolean;
    onClick: () => void;
}

export const ExpandToggle: React.FC<ExpandToggleProps> = React.memo(({
    isExpanded,
    onClick,
}) => (
    <td className="w-8 pl-0 pr-0 py-4" onClick={onClick}>
        <div className="p-1 hover:bg-muted rounded-full transition-colors flex items-center justify-center">
            {isExpanded
                ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                : <ChevronRight className="w-4 h-4 text-muted-foreground" />
            }
        </div>
    </td>
));

ExpandToggle.displayName = "ExpandToggle";

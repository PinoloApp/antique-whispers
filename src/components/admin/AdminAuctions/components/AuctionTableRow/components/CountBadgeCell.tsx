import React from "react";
import { Badge } from "@/components/ui/badge";

interface CountBadgeCellProps {
    icon: React.ElementType;
    count: number;
}

export const CountBadgeCell: React.FC<CountBadgeCellProps> = React.memo(({
    icon: Icon,
    count,
}) => (
    <td className="px-6 py-4 text-center">
        <Badge variant="outline" className="font-medium flex items-center gap-1 justify-center">
            <Icon className="w-3 h-3" />
            {count}
        </Badge>
    </td>
));

CountBadgeCell.displayName = "CountBadgeCell";

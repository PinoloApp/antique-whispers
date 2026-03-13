import React from "react";

interface StatPillProps {
    icon: React.ElementType;
    count: number;
}

export const StatPill: React.FC<StatPillProps> = React.memo(({ icon: Icon, count }) => (
    <span className="text-xs text-muted-foreground flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {count}
    </span>
));

StatPill.displayName = "StatPill";

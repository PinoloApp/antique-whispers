import React from "react";
import { LucideIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface ActionMenuItemProps {
    icon: LucideIcon;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    className?: string;
}

export const ActionMenuItem: React.FC<ActionMenuItemProps> = React.memo(({
    icon: Icon,
    label,
    onClick,
    className,
}) => (
    <DropdownMenuItem onClick={onClick} className={className}>
        <Icon className="w-4 h-4 mr-2" />
        {label}
    </DropdownMenuItem>
));

ActionMenuItem.displayName = "ActionMenuItem";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Clock, Pause, XCircle, CheckCircle } from "lucide-react";

type Language = "en" | "sr";
type AuctionStatus = "active" | "upcoming" | "paused" | "cancelled" | "completed";

const STATUS_CONFIG: Record<AuctionStatus, {
    icon: React.ElementType;
    className: string;
    label: Record<Language, string>;
}> = {
    active: {
        icon: PlayCircle,
        className: "bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30",
        label: { en: "Active", sr: "Aktivna" },
    },
    upcoming: {
        icon: Clock,
        className: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/30",
        label: { en: "Upcoming", sr: "Predstojeća" },
    },
    paused: {
        icon: Pause,
        className: "bg-orange-500/20 text-orange-600 border-orange-500/30 hover:bg-orange-500/30",
        label: { en: "Paused", sr: "Pauzirana" },
    },
    cancelled: {
        icon: XCircle,
        className: "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30",
        label: { en: "Cancelled", sr: "Otkazana" },
    },
    completed: {
        icon: CheckCircle,
        className: "bg-muted text-muted-foreground",
        label: { en: "Completed", sr: "Završena" },
    },
};

interface StatusBadgeCellProps {
    status: AuctionStatus;
    language: Language;
}

export const StatusBadgeCell: React.FC<StatusBadgeCellProps> = React.memo(({
    status,
    language,
}) => {
    const { icon: Icon, className, label } = STATUS_CONFIG[status];
    return (
        <td className="px-6 py-4 text-center">
            <Badge className={`flex items-center gap-1 ${className}`}>
                <Icon className="w-3 h-3" />
                {label[language]}
            </Badge>
        </td>
    );
});

StatusBadgeCell.displayName = "StatusBadgeCell";

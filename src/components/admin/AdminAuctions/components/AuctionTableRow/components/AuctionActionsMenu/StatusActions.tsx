import React from "react";
import { LucideIcon, Play, XCircle, Pause, Square, RotateCcw } from "lucide-react";

import { ActionMenuItem } from "./ActionMenuItem";
import { AuctionActions, AuctionStatus, Language } from "../../AuctionTableRow";

interface MenuItem {
    icon: LucideIcon;
    label: Record<Language, string>;
    className?: string;
    action: (id: number) => void;
}

interface StatusActionsProps {
    status: AuctionStatus;
    auctionId: number;
    language: Language;
    auctionActions: AuctionActions;
    withStop: (handler: () => void) => (e: React.MouseEvent) => void;
}

const getStatusMenuItems = (actions: AuctionActions): Partial<Record<AuctionStatus, MenuItem[]>> => ({
    upcoming: [
        {
            icon: Play,
            label: { en: "Activate", sr: "Aktiviraj" },
            className: "text-green-600",
            action: actions.handleActivateClick,
        },
        {
            icon: XCircle,
            label: { en: "Cancel", sr: "Otkaži" },
            className: "text-destructive",
            action: actions.handleCancelClick,
        },
    ],
    active: [
        {
            icon: Pause,
            label: { en: "Pause", sr: "Pauziraj" },
            className: "text-orange-500",
            action: actions.handlePauseClick,
        },
        {
            icon: Square,
            label: { en: "Close", sr: "Zatvori" },
            className: "text-blue-600",
            action: actions.handleCloseClick,
        },
    ],
    paused: [
        {
            icon: RotateCcw,
            label: { en: "Resume", sr: "Nastavi" },
            className: "text-green-600",
            action: actions.handleResumeClick,
        },
        {
            icon: XCircle,
            label: { en: "Cancel", sr: "Otkaži" },
            className: "text-destructive",
            action: actions.handleCancelClick,
        },
    ],
});

export const StatusActions: React.FC<StatusActionsProps> = React.memo(({
    status,
    auctionId,
    language,
    auctionActions,
    withStop,
}) => {
    const statusItems = getStatusMenuItems(auctionActions)[status] ?? [];

    if (statusItems.length === 0) return null;

    return (
        <>
            {statusItems.map(({ icon, label, className, action }) => (
                <ActionMenuItem
                    key={label.en}
                    icon={icon}
                    label={label[language]}
                    className={className}
                    onClick={withStop(() => action(auctionId))}
                />
            ))}
        </>
    );
});

StatusActions.displayName = "StatusActions";

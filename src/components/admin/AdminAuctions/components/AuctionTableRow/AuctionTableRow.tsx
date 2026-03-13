import React from "react";
import { Package, Layers, Gavel } from "lucide-react";
import { AuctionExpandedContent, AuctionExpandedContentProps } from "../AuctionExpandedContent/index";

// Sub-components
import { ExpandToggle } from "./components/ExpandToggle";
import { AuctionTitleCell } from "./components/AuctionTitleCell";
import { DateCell } from "./components/DateCell";
import { CountBadgeCell } from "./components/CountBadgeCell";
import { StatusBadgeCell } from "./components/StatusBadgeCell";
import { AuctionActionsMenu } from "./components/AuctionActionsMenu";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Language = "en" | "sr";
export type AuctionStatus = "active" | "upcoming" | "paused" | "cancelled" | "completed";

export interface Auction {
    id: number;
    title: Record<Language, string>;
    description: Record<Language, string>;
    startDate: string;
    endDate: string;
    status: AuctionStatus;
    lotIds?: number[];
    collectionIds?: number[];
}

export interface AuctionActions {
    handleActivateClick: (id: number) => void;
    handleCancelClick: (id: number) => void;
    handlePauseClick: (id: number) => void;
    handleCloseClick: (id: number) => void;
    handleResumeClick: (id: number) => void;
    handleDeleteClick: (id: number) => void;
}

export interface AuctionForm {
    handleEdit: (auction: Auction) => void;
}

export interface AuctionTableRowProps {
    auction: Auction;
    language: Language;
    isExpanded: boolean;
    toggleAuctionExpand: (id: number) => void;
    totalBids: number;
    auctionActions: AuctionActions;
    auctionForm: AuctionForm;
    expandedContentProps: AuctionExpandedContentProps;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const AuctionTableRow: React.FC<AuctionTableRowProps> = React.memo(({
    auction,
    language,
    isExpanded,
    toggleAuctionExpand,
    totalBids,
    auctionActions,
    auctionForm,
    expandedContentProps,
}) => {
    // Memoized toggle handler to prevent unnecessary re-renders of sub-components
    const onToggle = React.useCallback(() => {
        toggleAuctionExpand(auction.id);
    }, [toggleAuctionExpand, auction.id]);

    return (
        <React.Fragment>
            <tr className="hover:bg-muted/30 transition-colors cursor-pointer">
                <ExpandToggle isExpanded={isExpanded} onClick={onToggle} />
                <AuctionTitleCell auction={auction} language={language} onClick={onToggle} />
                <DateCell date={auction.startDate} />
                <DateCell date={auction.endDate} />
                <CountBadgeCell icon={Package} count={auction.lotIds?.length ?? 0} />
                <CountBadgeCell icon={Layers} count={auction.collectionIds?.length ?? 0} />
                <CountBadgeCell icon={Gavel} count={totalBids} />
                <StatusBadgeCell status={auction.status} language={language} />
                <AuctionActionsMenu
                    auction={auction}
                    language={language}
                    auctionActions={auctionActions}
                    auctionForm={auctionForm}
                />
            </tr>

            {isExpanded && (
                <tr className="bg-muted/20">
                    <td colSpan={9} className="px-6 py-4">
                        <AuctionExpandedContent
                            auction={auction}
                            language={language}
                            {...expandedContentProps}
                        />
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
});

AuctionTableRow.displayName = "AuctionTableRow";
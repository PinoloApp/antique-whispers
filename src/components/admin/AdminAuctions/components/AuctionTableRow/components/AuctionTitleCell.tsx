import React from "react";

interface Auction {
    id: number;
    title: Record<string, string>;
    description: Record<string, string>;
}

interface AuctionTitleCellProps {
    auction: Auction;
    language: string;
    onClick: () => void;
}

export const AuctionTitleCell: React.FC<AuctionTitleCellProps> = React.memo(({
    auction,
    language,
    onClick,
}) => (
    <td className="pl-2 pr-6 py-4" onClick={onClick}>
        <div className="font-medium text-foreground">{auction.title[language]}</div>
        <div className="text-sm text-muted-foreground line-clamp-1">
            {auction.description[language]}
        </div>
    </td>
));

AuctionTitleCell.displayName = "AuctionTitleCell";

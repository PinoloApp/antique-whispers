import React, { useMemo } from "react";
import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bid, Language } from "../types";

interface BidRowProps {
    bid: Bid;
    rank: number;
    language: Language;
}

const BidRow: React.FC<BidRowProps> = React.memo(({ bid, rank, language }) => {
    const isLivePlaceholder = bid.bidderEmail === "live@auction.com" || !bid.bidderEmail;
    const t = (en: string, sr: string) => language === "en" ? en : sr;

    return (
        <tr className={bid.isWinning ? "bg-green-500/10" : ""}>
            <td className="px-2 py-1.5 text-muted-foreground">{rank}</td>
            <td className="px-2 py-1.5 font-medium">{bid.bidderName}</td>
            <td className="px-2 py-1.5 text-muted-foreground">
                {isLivePlaceholder
                    ? <span className="text-muted-foreground/50 italic">{t("Not provided", "Nije unesen")}</span>
                    : bid.bidderEmail
                }
            </td>
            <td className="px-2 py-1.5 text-center">
                {bid.isLiveAuction ? (
                    <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 text-xs">
                        <Radio className="w-2 h-2 mr-1" /> Live
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-xs text-muted-foreground">Online</Badge>
                )}
            </td>
            <td className="px-2 py-1.5 text-right font-medium">€{bid.currentAmount.toLocaleString()}</td>
            <td className="px-2 py-1.5 text-right text-muted-foreground">€{bid.maxAmount.toLocaleString()}</td>
            <td className="px-2 py-1.5 text-right text-muted-foreground">
                {new Date(bid.timestamp).toLocaleDateString()}
            </td>
        </tr>
    );
});

BidRow.displayName = "BidRow";

interface BidTableProps {
    bids: Bid[];
    language: Language;
}

export const BidTable: React.FC<BidTableProps> = React.memo(({ bids, language }) => {
    const t = (en: string, sr: string) => language === "en" ? en : sr;
    
    const sorted = useMemo(
        () => [...bids].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [bids]
    );

    if (sorted.length === 0) {
        return (
            <div className="text-sm text-muted-foreground text-center py-4">
                {t("No bids yet", "Još nema ponuda")}
            </div>
        );
    }

    return (
        <table className="w-full text-sm">
            <thead className="bg-muted/50">
                <tr>
                    <th className="px-2 py-1.5 text-left text-xs">#</th>
                    <th className="px-2 py-1.5 text-left text-xs">{t("Bidder", "Ponuđač")}</th>
                    <th className="px-2 py-1.5 text-left text-xs">Email</th>
                    <th className="px-2 py-1.5 text-center text-xs">{t("Source", "Izvor")}</th>
                    <th className="px-2 py-1.5 text-right text-xs">{t("Current", "Trenutno")}</th>
                    <th className="px-2 py-1.5 text-right text-xs">Max</th>
                    <th className="px-2 py-1.5 text-right text-xs">{t("Date", "Datum")}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {sorted.map((bid, index) => (
                    <BidRow key={bid.id} bid={bid} rank={sorted.length - index} language={language} />
                ))}
            </tbody>
        </table>
    );
});

BidTable.displayName = "BidTable";

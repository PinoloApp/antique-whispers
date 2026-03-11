import React from "react";
import {
    ChevronDown,
    ChevronRight,
    PlayCircle,
    Clock,
    CheckCircle,
    Package,
    Layers,
    Pencil,
    Play,
    XCircle,
    Pause,
    Square,
    RotateCcw,
    Trash2,
    MoreHorizontal,
    Gavel
} from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuctionExpandedContent } from "./AuctionExpandedContent";

interface AuctionTableRowProps {
    auction: any;
    language: "en" | "sr";
    isExpanded: boolean;
    toggleAuctionExpand: (id: number) => void;
    totalBids: number;
    auctionLots: any[];
    auctionCategories: any[];
    lotsWithBids: number;
    auctionActions: any;
    auctionForm: any;
    expandedContentProps: any;
}

export const AuctionTableRow: React.FC<AuctionTableRowProps> = ({
    auction,
    language,
    isExpanded,
    toggleAuctionExpand,
    totalBids,
    auctionActions,
    auctionForm,
    expandedContentProps,
}) => {
    return (
        <React.Fragment key={auction.id}>
            <tr
                className="hover:bg-muted/30 transition-colors cursor-pointer"
            >
                <td className="w-8 pl-0 pr-0 py-4" onClick={() => toggleAuctionExpand(auction.id)}>
                    <div className="p-1 hover:bg-muted rounded-full transition-colors flex items-center justify-center">
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        )}
                    </div>
                </td>
                <td className="pl-2 pr-6 py-4" onClick={() => toggleAuctionExpand(auction.id)}>
                    <div className="font-medium text-foreground">{auction.title[language]}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">
                        {auction.description[language]}
                    </div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                    <div>{format(new Date(auction.startDate), "MMM dd, yyyy")}</div>
                    <div className="text-xs">{format(new Date(auction.startDate), "HH:mm")}</div>
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                    <div>{format(new Date(auction.endDate), "MMM dd, yyyy")}</div>
                    <div className="text-xs">{format(new Date(auction.endDate), "HH:mm")}</div>
                </td>
                <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className="font-medium flex items-center gap-1 justify-center">
                        <Package className="w-3 h-3" />
                        {auction.lotIds?.length || 0}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className="font-medium flex items-center gap-1 justify-center">
                        <Layers className="w-3 h-3" />
                        {auction.collectionIds?.length || 0}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                    <Badge variant="outline" className="font-medium flex items-center gap-1 justify-center">
                        <Gavel className="w-3 h-3" />
                        {totalBids}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-center">
                    <Badge
                        className={`flex items-center gap-1 ${auction.status === "active"
                            ? "bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500/30"
                            : auction.status === "upcoming"
                                ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30 hover:bg-yellow-500/30"
                                : auction.status === "paused"
                                    ? "bg-orange-500/20 text-orange-600 border-orange-500/30 hover:bg-orange-500/30"
                                    : auction.status === "cancelled"
                                        ? "bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30"
                                        : "bg-muted text-muted-foreground"
                            }`}
                    >
                        {auction.status === "active" ? (
                            <PlayCircle className="w-3 h-3" />
                        ) : auction.status === "upcoming" ? (
                            <Clock className="w-3 h-3" />
                        ) : auction.status === "paused" ? (
                            <Pause className="w-3 h-3" />
                        ) : auction.status === "cancelled" ? (
                            <XCircle className="w-3 h-3" />
                        ) : (
                            <CheckCircle className="w-3 h-3" />
                        )}
                        {auction.status === "active"
                            ? language === "en" ? "Active" : "Aktivna"
                            : auction.status === "upcoming"
                                ? language === "en" ? "Upcoming" : "Predstojeća"
                                : auction.status === "paused"
                                    ? language === "en" ? "Paused" : "Pauzirana"
                                    : auction.status === "cancelled"
                                        ? language === "en" ? "Cancelled" : "Otkazana"
                                        : language === "en" ? "Completed" : "Završena"}
                    </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {auction.status !== "completed" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            auctionForm.handleEdit(auction);
                                        }}
                                    >
                                        <Pencil className="w-4 h-4 mr-2" />
                                        {language === "en" ? "Edit" : "Uredi"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            {auction.status === "upcoming" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            auctionActions.handleActivateClick(auction.id);
                                        }}
                                        className="text-green-600"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        {language === "en" ? "Activate" : "Aktiviraj"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            auctionActions.handleCancelClick(auction.id);
                                        }}
                                        className="text-destructive"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        {language === "en" ? "Cancel" : "Otkaži"}
                                    </DropdownMenuItem>
                                </>
                            )}
                            {auction.status === "active" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            auctionActions.handlePauseClick(auction.id);
                                        }}
                                        className="text-orange-500"
                                    >
                                        <Pause className="w-4 h-4 mr-2" />
                                        {language === "en" ? "Pause" : "Pauziraj"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            auctionActions.handleCloseClick(auction.id);
                                        }}
                                        className="text-blue-600"
                                    >
                                        <Square className="w-4 h-4 mr-2" />
                                        {language === "en" ? "Close" : "Zatvori"}
                                    </DropdownMenuItem>
                                </>
                            )}
                            {auction.status === "paused" && (
                                <>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            auctionActions.handleResumeClick(auction.id);
                                        }}
                                        className="text-green-600"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        {language === "en" ? "Resume" : "Nastavi"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            auctionActions.handleCancelClick(auction.id);
                                        }}
                                        className="text-destructive"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        {language === "en" ? "Cancel" : "Otkaži"}
                                    </DropdownMenuItem>
                                </>
                            )}
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        auctionActions.handleDeleteClick(auction.id);
                                    }}
                                    className="text-destructive"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {language === "en" ? "Delete" : "Obriši"}
                                </DropdownMenuItem>
                            </>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </td>
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
};

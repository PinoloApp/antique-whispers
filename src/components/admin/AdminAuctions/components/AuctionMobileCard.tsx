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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuctionExpandedContent, AuctionExpandedContentProps } from "./AuctionExpandedContent/index";
import { Language } from "./AuctionExpandedContent/types";

interface AuctionMobileCardProps {
    auction: any;
    language: Language;
    isExpanded: boolean;
    toggleAuctionExpand: (id: number) => void;
    totalBids: number;
    auctionActions: any;
    auctionForm: any;
    expandedContentProps: AuctionExpandedContentProps;
}

export const AuctionMobileCard: React.FC<AuctionMobileCardProps> = ({
    auction,
    language,
    isExpanded,
    toggleAuctionExpand,
    totalBids,
    auctionActions,
    auctionForm,
    expandedContentProps
}) => {
    return (
        <Collapsible open={isExpanded} onOpenChange={() => toggleAuctionExpand(auction.id)}>
            <div className="bg-card rounded-lg border border-border overflow-hidden">
                <CollapsibleTrigger asChild>
                    <div className="p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-foreground truncate">{auction.title[language]}</div>
                                    <div className="text-sm text-muted-foreground line-clamp-2">
                                        {auction.description[language]}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Badge
                                    className={`flex items-center gap-1 ${auction.status === "active"
                                        ? "bg-green-500/20 text-green-600 border-green-500/30"
                                        : auction.status === "upcoming"
                                            ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                            : auction.status === "paused"
                                                ? "bg-orange-500/20 text-orange-600 border-orange-500/30"
                                                : auction.status === "cancelled"
                                                    ? "bg-red-500/20 text-red-500 border-red-500/30"
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

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
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
                            </div>
                        </div>
                        <div className="grid grid-cols-2 xs:grid-cols-3 gap-y-4 gap-x-2 text-sm mb-4 ml-6 mt-2">
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Start:" : "Početak:"}</span>
                                <div className="text-foreground text-xs">
                                    {format(new Date(auction.startDate), "dd.MM.yy")}
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "End:" : "Kraj:"}</span>
                                <div className="text-foreground text-xs">
                                    {format(new Date(auction.endDate), "dd.MM.yy")}
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Lots:" : "Lotova:"}</span>
                                <div className="text-foreground font-medium flex items-center gap-1">
                                    <Package className="w-3 h-3 text-muted-foreground" />
                                    {auction.lotIds?.length || 0}
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Collections:" : "Kolekcija:"}</span>
                                <div className="text-foreground font-medium flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-muted-foreground" />
                                    {auction.collectionIds?.length || 0}
                                </div>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Bids:" : "Ponuda:"}</span>
                                <div className="text-foreground font-medium flex items-center gap-1">
                                    <Gavel className="w-3 h-3 text-muted-foreground" />
                                    {totalBids}
                                </div>
                            </div>
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="border-t border-border bg-muted/20 p-4 space-y-4">
                        <AuctionExpandedContent
                            auction={auction}
                            language={language}
                            {...expandedContentProps}
                        />


                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
};

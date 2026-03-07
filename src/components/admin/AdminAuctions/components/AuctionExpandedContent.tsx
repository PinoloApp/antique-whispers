import React from "react";
import {
    Search,
    ChevronDown,
    ChevronRight,
    ChevronsDownUp,
    ChevronsUpDown,
    Package,
    Layers,
    Gavel,
    Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AuctionExpandedContentProps {
    auction: any;
    language: "en" | "sr";
    getLotSearchQuery: (id: number) => string;
    setLotSearchQuery: (id: number, query: string) => void;
    collapseAllForAuction: (id: number) => void;
    expandAllForAuction: (id: number) => void;
    isSearchActive: (id: number) => boolean;
    hasMatchingLotsInCategory: (auctionId: number, categoryId: string) => boolean;
    hasMatchingLotsInSubcategory: (auctionId: number, subcategoryId: string) => boolean;
    getAuctionCategories: (id: number) => any[];
    getCategoryStats: (auctionId: number, categoryId: string) => any;
    getSubcategoryStats: (auctionId: number, subcategoryId: string) => any;
    getAuctionSubcategoriesForCategory: (auctionId: number, categoryId: string) => any[];
    filterLotsBySearch: (lots: any[], auctionId: number) => any[];
    getAuctionLotsForSubcategory: (auctionId: number, subcategoryId: string) => any[];
    getAuctionLotsWithoutSubcategory: (auctionId: number, categoryId: string) => any[];
    getSubcategoryCollections: (auctionId: number, subcategoryId: string) => any[];
    getCollectionsWithoutSubcategory: (auctionId: number, categoryId: string) => any[];
    getLotBidInfo: (id: number, auctionId: number) => any;
    getCollectionBidInfo: (id: number, auctionId: number) => any;
    getProductBids: (id: number, auctionId: number) => any[];
    toggleViewCategory: (key: string) => void;
    toggleViewSubcategory: (key: string) => void;
    toggleViewLot: (key: string) => void;
    expandedViewCategories: string[];
    expandedViewSubcategories: string[];
    expandedViewLots: string[];
    handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
    collectionProducts: any[];
}

export const AuctionExpandedContent: React.FC<AuctionExpandedContentProps> = ({
    auction,
    language,
    getLotSearchQuery,
    setLotSearchQuery,
    collapseAllForAuction,
    expandAllForAuction,
    isSearchActive,
    hasMatchingLotsInCategory,
    hasMatchingLotsInSubcategory,
    getAuctionCategories,
    getCategoryStats,
    getSubcategoryStats,
    getAuctionSubcategoriesForCategory,
    filterLotsBySearch,
    getAuctionLotsForSubcategory,
    getAuctionLotsWithoutSubcategory,
    getSubcategoryCollections,
    getCollectionsWithoutSubcategory,
    getLotBidInfo,
    getCollectionBidInfo,
    getProductBids,
    toggleViewCategory,
    toggleViewSubcategory,
    toggleViewLot,
    expandedViewCategories,
    expandedViewSubcategories,
    expandedViewLots,
    handleOpenAddBidDialog,
    collectionProducts
}) => {
    const auctionCategories = getAuctionCategories(auction.id);
    const searchActive = isSearchActive(auction.id);

    return (
        <div className="space-y-4">
            {/* Search and Expand/Collapse All */}
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder={
                            language === "en"
                                ? "Search lots by number or name..."
                                : "Pretraži lotove po broju ili nazivu..."
                        }
                        value={getLotSearchQuery(auction.id)}
                        onChange={(e) => setLotSearchQuery(auction.id, e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-transparent hover:text-foreground"
                        onClick={() => collapseAllForAuction(auction.id)}
                    >
                        <ChevronsDownUp className="w-4 h-4 mr-1" />
                        {language === "en" ? "Collapse All" : "Skupi Sve"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-transparent hover:text-foreground"
                        onClick={() => expandAllForAuction(auction.id)}
                    >
                        <ChevronsUpDown className="w-4 h-4 mr-1" />
                        {language === "en" ? "Expand All" : "Proširi Sve"}
                    </Button>
                </div>
            </div>

            {/* Hierarchical Categories > Subcategories > Lots */}
            <div className="space-y-1">
                {auctionCategories
                    .filter(
                        (category) =>
                            !searchActive ||
                            hasMatchingLotsInCategory(auction.id, category.id),
                    )
                    .map((category) => {
                        const catStats = getCategoryStats(auction.id, category.id);
                        const isCatExpanded =
                            searchActive || expandedViewCategories.includes(`${auction.id}-${category.id}`);
                        const subcategories = getAuctionSubcategoriesForCategory(
                            auction.id,
                            category.id,
                        ).filter(
                            (sub) => !searchActive || hasMatchingLotsInSubcategory(auction.id, sub.id),
                        );

                        return (
                            <div key={category.id} className="space-y-1">
                                {/* Category Row */}
                                <button
                                    type="button"
                                    className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded-md transition-colors text-left"
                                    onClick={() => toggleViewCategory(`${auction.id}-${category.id}`)}
                                >
                                    {isCatExpanded ? (
                                        <ChevronDown className="w-4 h-4 shrink-0" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 shrink-0" />
                                    )}

                                    <span className="font-medium">{category.title[language]}</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {catStats.totalLots}
                                    </span>
                                    {catStats.totalCollections > 0 && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Layers className="w-3 h-3" />
                                            {catStats.totalCollections}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Gavel className="w-3 h-3" />
                                        {catStats.totalBids}
                                    </span>
                                    <span className="flex-1" />
                                </button>

                                {/* Subcategories */}
                                {isCatExpanded && (
                                    <div className="ml-6 space-y-1">
                                        {subcategories.map((subcategory) => {
                                            const subStats = getSubcategoryStats(auction.id, subcategory.id);
                                            const isSubExpanded =
                                                searchActive ||
                                                expandedViewSubcategories.includes(`${auction.id}-${subcategory.id}`);
                                            const subcategoryLots = filterLotsBySearch(
                                                getAuctionLotsForSubcategory(auction.id, subcategory.id),
                                                auction.id,
                                            );

                                            return (
                                                <div key={subcategory.id} className="space-y-1">
                                                    {/* Subcategory Row */}
                                                    <button
                                                        type="button"
                                                        className="flex items-center gap-2 w-full p-2 hover:bg-muted/50 rounded-md transition-colors text-left text-sm"
                                                        onClick={() =>
                                                            toggleViewSubcategory(`${auction.id}-${subcategory.id}`)
                                                        }
                                                    >
                                                        {isSubExpanded ? (
                                                            <ChevronDown className="w-3 h-3 shrink-0" />
                                                        ) : (
                                                            <ChevronRight className="w-3 h-3 shrink-0" />
                                                        )}
                                                        <span className="text-muted-foreground">
                                                            {subcategory.title[language]}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Package className="w-3 h-3" />
                                                            {subStats.totalLots}
                                                        </span>
                                                        {subStats.totalCollections > 0 && (
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Layers className="w-3 h-3" />
                                                                {subStats.totalCollections}
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <Gavel className="w-3 h-3" />
                                                            {subStats.totalBids}
                                                        </span>
                                                        <span className="flex-1" />
                                                    </button>

                                                    {/* Lots & Collections */}
                                                    {isSubExpanded && (
                                                        <div className="ml-5 mt-2 space-y-1">
                                                            {subcategoryLots.map((lot) => (
                                                                <LotItem
                                                                    key={lot.id}
                                                                    lot={lot}
                                                                    auctionId={auction.id}
                                                                    language={language}
                                                                    getLotBidInfo={getLotBidInfo}
                                                                    getProductBids={getProductBids}
                                                                    isLotExpanded={expandedViewLots.includes(`${auction.id}-${lot.id}`)}
                                                                    toggleViewLot={toggleViewLot}
                                                                    isHighlighted={searchActive && filterLotsBySearch([lot], auction.id).length > 0}
                                                                    handleOpenAddBidDialog={handleOpenAddBidDialog}
                                                                />
                                                            ))}
                                                            {getSubcategoryCollections(auction.id, subcategory.id).map((col) => (
                                                                <CollectionItem
                                                                    key={col.id}
                                                                    col={col}
                                                                    auctionId={auction.id}
                                                                    language={language}
                                                                    getCollectionBidInfo={getCollectionBidInfo}
                                                                    getProductBids={getProductBids}
                                                                    isColExpanded={expandedViewLots.includes(`col-${auction.id}-${col.id}`)}
                                                                    toggleViewLot={toggleViewLot}
                                                                    handleOpenAddBidDialog={handleOpenAddBidDialog}
                                                                    collectionProducts={collectionProducts}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* Lots & Collections without subcategory */}
                                        {filterLotsBySearch(
                                            getAuctionLotsWithoutSubcategory(auction.id, category.id),
                                            auction.id,
                                        ).map((lot) => (
                                            <LotItem
                                                key={lot.id}
                                                lot={lot}
                                                auctionId={auction.id}
                                                language={language}
                                                getLotBidInfo={getLotBidInfo}
                                                getProductBids={getProductBids}
                                                isLotExpanded={expandedViewLots.includes(`${auction.id}-${lot.id}`)}
                                                toggleViewLot={toggleViewLot}
                                                isHighlighted={searchActive && filterLotsBySearch([lot], auction.id).length > 0}
                                                handleOpenAddBidDialog={handleOpenAddBidDialog}
                                            />
                                        ))}
                                        {getCollectionsWithoutSubcategory(auction.id, category.id).map((col) => (
                                            <CollectionItem
                                                key={col.id}
                                                col={col}
                                                auctionId={auction.id}
                                                language={language}
                                                getCollectionBidInfo={getCollectionBidInfo}
                                                getProductBids={getProductBids}
                                                isColExpanded={expandedViewLots.includes(`col-${auction.id}-${col.id}`)}
                                                toggleViewLot={toggleViewLot}
                                                handleOpenAddBidDialog={handleOpenAddBidDialog}
                                                collectionProducts={collectionProducts}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
};

interface LotItemProps {
    lot: any;
    auctionId: number;
    language: "en" | "sr";
    getLotBidInfo: (id: number, auctionId: number) => any;
    getProductBids: (id: number, auctionId: number) => any[];
    isLotExpanded: boolean;
    toggleViewLot: (key: string) => void;
    isHighlighted: boolean;
    handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
}

const LotItem: React.FC<LotItemProps> = ({
    lot,
    auctionId,
    language,
    getLotBidInfo,
    getProductBids,
    isLotExpanded,
    toggleViewLot,
    isHighlighted,
    handleOpenAddBidDialog
}) => {
    const bidInfo = getLotBidInfo(lot.id, auctionId);
    const lotBids = getProductBids(lot.id, auctionId);

    return (
        <div className="space-y-1">
            <button
                type="button"
                className={`flex items-center gap-3 w-full p-2 rounded-md border transition-colors text-left ${isHighlighted
                    ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30"
                    : "bg-background border-border hover:bg-muted/30"
                    }`}
                onClick={() => toggleViewLot(`${auctionId}-${lot.id}`)}
            >
                {isLotExpanded ? (
                    <ChevronDown className="w-3 h-3 shrink-0" />
                ) : (
                    <ChevronRight className="w-3 h-3 shrink-0" />
                )}
                <img
                    src={lot.image}
                    alt=""
                    className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium truncate">
                        Lot {lot.lot}: {language === "en" ? lot.name : lot.namesr}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                        <Gavel className="w-3 h-3" />
                        {bidInfo.totalBids}
                    </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 shrink-0"
                        title={language === "en" ? "Add Live Bid" : "Dodaj Live Ponudu"}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAddBidDialog(lot.id, auctionId);
                        }}
                    >
                        <Radio className="w-4 h-4" />
                    </Button>
                    {bidInfo.totalBids > 0 ? (
                        <>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">
                                    €{lot.startingPrice?.toLocaleString() || lot.currentBid.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {language === "en" ? "Starting" : "Početna"}
                                </div>
                            </div>
                            <span className="text-muted-foreground">–</span>
                            <div className="text-right">
                                <div className="font-medium text-green-600">
                                    €{bidInfo.highestBid.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {language === "en" ? "Current" : "Trenutna"}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                                €{lot.startingPrice?.toLocaleString() || lot.currentBid.toLocaleString()}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {language === "en" ? "Starting" : "Početna"}
                            </div>
                        </div>
                    )}
                </div>
            </button>

            {/* Bid List */}
            {isLotExpanded && (
                <div className="ml-6 p-3 bg-muted/30 rounded-md border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-foreground">
                            {language === "en" ? "Bid History" : "Istorija Ponuda"}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddBidDialog(lot.id, auctionId);
                            }}
                        >
                            <Radio className="w-3 h-3" />
                            {language === "en" ? "Add Live Bid" : "Dodaj Live Ponudu"}
                        </Button>
                    </div>
                    <BidTable bids={lotBids} language={language} />
                </div>
            )}
        </div>
    );
};

interface CollectionItemProps {
    col: any;
    auctionId: number;
    language: "en" | "sr";
    getCollectionBidInfo: (id: number, auctionId: number) => any;
    getProductBids: (id: number, auctionId: number) => any[];
    isColExpanded: boolean;
    toggleViewLot: (key: string) => void;
    handleOpenAddBidDialog: (lotId: number, auctionId: number) => void;
    collectionProducts: any[];
}

const CollectionItem: React.FC<CollectionItemProps> = ({
    col,
    auctionId,
    language,
    getCollectionBidInfo,
    getProductBids,
    isColExpanded,
    toggleViewLot,
    handleOpenAddBidDialog,
    collectionProducts
}) => {
    const bidInfo = getCollectionBidInfo(col.id, auctionId);
    const colBids = getProductBids(col.id, auctionId);

    const getColImage = (collection: any) => {
        if (collection.image) return collection.image;
        if (collection.productIds && collection.productIds.length > 0) {
            const firstProduct = collectionProducts.find(p => p.id === collection.productIds[0]);
            return firstProduct?.image || (firstProduct?.images && firstProduct.images[0]) || "";
        }
        return "";
    };

    const colThumbnail = getColImage(col);

    return (
        <div key={`col-${col.id}`} className="space-y-1">
            <button
                type="button"
                className="flex items-center gap-3 w-full p-2 rounded-md border bg-background border-border hover:bg-muted/30 transition-colors text-left"
                onClick={() => toggleViewLot(`col-${auctionId}-${col.id}`)}
            >
                {isColExpanded ? <ChevronDown className="w-3 h-3 shrink-0" /> : <ChevronRight className="w-3 h-3 shrink-0" />}
                {colThumbnail ? <img src={colThumbnail} alt="" className="w-10 h-10 rounded object-cover" /> : <div className="w-10 h-10 rounded bg-muted flex items-center justify-center"><Package className="w-4 h-4 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                    <span className="font-medium truncate">{col.lotNumber}: {language === "en" ? col.name.en : col.name.sr}</span>
                    <Badge variant="outline" className="text-xs shrink-0">{language === "en" ? "Collection" : "Kolekcija"}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0"><Gavel className="w-3 h-3" />{bidInfo.totalBids}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 shrink-0"
                        title={language === "en" ? "Add Live Bid" : "Dodaj Live Ponudu"}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenAddBidDialog(col.id, auctionId);
                        }}
                    >
                        <Radio className="w-4 h-4" />
                    </Button>
                    {bidInfo.totalBids > 0 ? (
                        <>
                            <div className="text-right">
                                <div className="text-sm text-muted-foreground">€{col.startingPrice.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">{language === "en" ? "Starting" : "Početna"}</div>
                            </div>
                            <span className="text-muted-foreground">–</span>
                            <div className="text-right">
                                <div className="font-medium text-green-600">€{bidInfo.highestBid.toLocaleString()}</div>
                                <div className="text-[10px] text-muted-foreground">{language === "en" ? "Current" : "Trenutna"}</div>
                            </div>
                        </>
                    ) : (
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">€{col.startingPrice.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground">{language === "en" ? "Starting" : "Početna"}</div>
                        </div>
                    )}
                </div>
            </button>
            {isColExpanded && (
                <div className="ml-6 p-3 bg-muted/30 rounded-md border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-foreground">
                            {language === "en" ? "Bid History" : "Istorija Ponuda"}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAddBidDialog(col.id, auctionId);
                            }}
                        >
                            <Radio className="w-3 h-3" />
                            {language === "en" ? "Add Live Bid" : "Dodaj Live Ponudu"}
                        </Button>
                    </div>
                    <BidTable bids={colBids} language={language} />
                </div>
            )}
        </div>
    );
}

const BidTable = ({ bids, language }: { bids: any[], language: "en" | "sr" }) => {
    if (bids.length === 0) {
        return (
            <div className="text-sm text-muted-foreground text-center py-4">
                {language === "en" ? "No bids yet" : "Još nema ponuda"}
            </div>
        );
    }

    return (
        <table className="w-full text-sm">
            <thead className="bg-muted/50">
                <tr>
                    <th className="px-2 py-1.5 text-left text-xs">#</th>
                    <th className="px-2 py-1.5 text-left text-xs">{language === "en" ? "Bidder" : "Ponuđač"}</th>
                    <th className="px-2 py-1.5 text-left text-xs">Email</th>
                    <th className="px-2 py-1.5 text-center text-xs">{language === "en" ? "Source" : "Izvor"}</th>
                    <th className="px-2 py-1.5 text-right text-xs">{language === "en" ? "Current" : "Trenutno"}</th>
                    <th className="px-2 py-1.5 text-right text-xs">Max</th>
                    <th className="px-2 py-1.5 text-right text-xs">{language === "en" ? "Date" : "Datum"}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {bids
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((bid, index) => (
                        <tr key={bid.id} className={bid.isWinning ? "bg-green-500/10" : ""}>
                            <td className="px-2 py-1.5 text-muted-foreground">{bids.length - index}</td>
                            <td className="px-2 py-1.5 font-medium">{bid.bidderName}</td>
                            <td className="px-2 py-1.5 text-muted-foreground">
                                {bid.bidderEmail === "live@auction.com" || !bid.bidderEmail ? (
                                    <span className="text-muted-foreground/50 italic">
                                        {language === "en" ? "Not provided" : "Nije unesen"}
                                    </span>
                                ) : (
                                    bid.bidderEmail
                                )}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                                {bid.isLiveAuction ? (
                                    <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30 text-xs">
                                        <Radio className="w-2 h-2 mr-1" />
                                        Live
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                        Online
                                    </Badge>
                                )}
                            </td>
                            <td className="px-2 py-1.5 text-right font-medium">€{bid.currentAmount.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right text-muted-foreground">€{bid.maxAmount.toLocaleString()}</td>
                            <td className="px-2 py-1.5 text-right text-muted-foreground">{new Date(bid.timestamp).toLocaleDateString()}</td>
                        </tr>
                    ))}
            </tbody>
        </table>
    );
};

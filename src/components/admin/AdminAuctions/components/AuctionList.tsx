import React from "react";
import { AuctionMobileCard } from "./AuctionMobileCard";
import { AuctionTableRow } from "./AuctionTableRow";
import Table from "../../AdminComponents/Table";
import PaginationControls from "../../AdminComponents/Pagination";
import { getPaginationLabel } from "@/utils/adminUsers.utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuctionListProps {
    language: "en" | "sr";
    expandedAuctionIds: number[];
    toggleAuctionExpand: (id: number) => void;
    getAuctionTotalBids: (id: number) => number;
    getAuctionLots: (id: number) => any[];
    getAuctionCategories: (id: number) => any[];
    getAuctionLotsWithBids: (id: number) => number;
    auctionActions: any;
    auctionForm: any;
    expandedContentProps: any;
    filterSortHook: any;
}

export const AuctionList: React.FC<AuctionListProps> = ({
    language,
    expandedAuctionIds,
    toggleAuctionExpand,
    getAuctionTotalBids,
    getAuctionLots,
    getAuctionCategories,
    getAuctionLotsWithBids,
    auctionActions,
    auctionForm,
    expandedContentProps,
    filterSortHook,
}) => {
    const {
        paginatedAuctions,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        totalCount,
        startIndex,
        endIndex,
        handleItemsPerPageChange
    } = filterSortHook;

    const { t } = useLanguage();

    const TABLE_COLUMNS = [
        { key: "expander", label: { en: "", sr: "" }, align: "text-left pl-0 pr-0 w-8" },
        { key: "title", label: { en: "Title", sr: "Naslov" }, align: "text-left pl-2" },
        { key: "startDate", label: { en: "Start Date", sr: "Datum Početka" }, align: "text-left px-6" },
        { key: "endDate", label: { en: "End Date", sr: "Datum Završetka" }, align: "text-left px-6" },
        { key: "lots", label: { en: "Lots", sr: "Lotovi" }, align: "text-center px-6" },
        { key: "collections", label: { en: "Collections", sr: "Kolekcije" }, align: "text-center px-6" },
        { key: "totalBids", label: { en: "Bids", sr: "Ponuda" }, align: "text-center px-6" },
        { key: "status", label: { en: "Status", sr: "Status" }, align: "text-center px-6" },
        { key: "actions", label: { en: "Actions", sr: "Akcije" }, align: "text-right px-6" },
    ];

    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {paginatedAuctions.map((auction: any) => {
                    const isExpanded = expandedAuctionIds.includes(auction.id);
                    const totalBids = getAuctionTotalBids(auction.id);
                    const auctionLots = getAuctionLots(auction.id);
                    const auctionCategories = getAuctionCategories(auction.id);
                    const lotsWithBids = getAuctionLotsWithBids(auction.id);

                    return (
                        <AuctionMobileCard
                            key={auction.id}
                            auction={auction}
                            language={language}
                            isExpanded={isExpanded}
                            toggleAuctionExpand={toggleAuctionExpand}
                            totalBids={totalBids}
                            auctionLots={auctionLots}
                            auctionCategories={auctionCategories}
                            lotsWithBids={lotsWithBids}
                            auctionActions={auctionActions}
                            auctionForm={auctionForm}
                            expandedContentProps={expandedContentProps}
                        />
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <Table
                TABLE_COLUMNS={TABLE_COLUMNS}
                showCheckbox={false}
                isAllSelected={false}
                handleSelectAllChange={() => { }}
                language={language}
            >
                <tbody className="divide-y divide-border">
                    {paginatedAuctions.map((auction: any) => {
                        const isExpanded = expandedAuctionIds.includes(auction.id);
                        const totalBids = getAuctionTotalBids(auction.id);
                        const auctionLots = getAuctionLots(auction.id);
                        const auctionCategories = getAuctionCategories(auction.id);
                        const lotsWithBids = getAuctionLotsWithBids(auction.id);

                        return (
                            <AuctionTableRow
                                key={auction.id}
                                auction={auction}
                                language={language}
                                isExpanded={isExpanded}
                                toggleAuctionExpand={toggleAuctionExpand}
                                totalBids={totalBids}
                                auctionLots={auctionLots}
                                auctionCategories={auctionCategories}
                                lotsWithBids={lotsWithBids}
                                auctionActions={auctionActions}
                                auctionForm={auctionForm}
                                expandedContentProps={expandedContentProps}
                            />
                        );
                    })}
                </tbody>
            </Table>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                perPageLabel={t("perPage")}
                paginationLabel={getPaginationLabel(startIndex, endIndex, totalCount, language === "en" ? "auctions" : "aukcija", t)}
            />
        </>
    );
};

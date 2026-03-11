import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { useCategories } from "@/hooks/useCategories";
import { useAuctionForm } from "@/components/admin/AdminAuctions/hooks/useAuctionForm";
import { useServerPaginatedAuctions } from "@/components/admin/AdminAuctions/hooks/useServerPaginatedAuctions";
import { useAuctionActions } from "./AdminAuctions/hooks/useAuctionActions";
import { AuctionDialogs } from "./AdminAuctions/AuctionDialogs";
import TitleHeader from "./AdminComponents/TitleHeader";
import NoData from "./AdminComponents/NoData";
import { AuctionFormModal } from "./AdminAuctions/AuctionFormModal";
import { AuctionList } from "./AdminAuctions/components/AuctionList";
import { useAuctionExpandedContent } from "./AdminAuctions/hooks/useAuctionExpandedContent";
import CategoryFilters from "./AdminCategories/components/CategoryFilters";
import { Loader2 } from "lucide-react";

import NoSearchFound from "./AdminComponents/filters/NoSearchFound";

const AdminAuctions = () => {
  const { language } = useLanguage();
  const {
    products,
    updateProduct,
    collections,
    updateCollection,
    collectionProducts,
    getProductBids,
    addBid,
  } = useData();
  const { categories } = useCategories();

  const statusOptions = [
    { value: "upcoming", labelEn: "Upcoming", labelSr: "Predstojeće" },
    { value: "active", labelEn: "Active", labelSr: "Aktivne" },
    { value: "completed", labelEn: "Completed", labelSr: "Završene" },
    { value: "paused", labelEn: "Paused", labelSr: "Pauzirane" },
    { value: "cancelled", labelEn: "Cancelled", labelSr: "Otkazane" },
  ];

  const filterSortHook = useServerPaginatedAuctions({
    language,
    statusOptions,
  });

  const { allAuctions, loading, refresh } = filterSortHook;

  const auctionActions = useAuctionActions({
    language,
    auctions: allAuctions,
    updateProduct,
    updateCollection,
    addBid,
    getProductBids,
    collections,
    products,
    onSuccess: refresh,
  });

  const auctionForm = useAuctionForm(
    language,
    products,
    collections,
    categories,
    (auctionData, isEdit) => {
      auctionActions.setPendingAuctionData(auctionData);
      if (isEdit) {
        auctionActions.openDialog("update");
      } else {
        auctionActions.openDialog("create");
      }
    }
  );

  const {
    expandedAuctionIds,
    toggleAuctionExpand,
    getAuctionTotalBids,
    getAuctionLots,
    getAuctionCategories,
    getAuctionLotsWithBids,
    expandedContentProps
  } = useAuctionExpandedContent({
    language,
    auctions: allAuctions,
    products,
    collections,
    collectionProducts,
    categories,
    getProductBids,
    handleOpenAddBidDialog: auctionActions.handleOpenAddBidDialog,
  });

  if (loading && filterSortHook.allAuctions.length === 0 && !filterSortHook.searchQuery.trim() && filterSortHook.statusFilter === "all") {
    return (
      <div className="flex justify-center items-center flex-1 h-[100vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (

    <div>
      <TitleHeader title={language === "en" ? "Manage Auctions" : "Upravljanje Aukcijama"}>
        <AuctionFormModal
          language={language}
          categories={categories}
          products={products}
          collections={collections}
          collectionProducts={collectionProducts}
          isMutating={auctionActions.isMutating}
          {...auctionForm}
        />
      </TitleHeader>

      {
        filterSortHook.totalCount === 0 && !loading && !filterSortHook.searchQuery.trim() && filterSortHook.statusFilter === "all" ? (
          <NoData
            icon="📅"
            title={language === "en" ? "No auctions yet" : "Nema aukcija"}
            description={language === "en"
              ? "Create your first auction to get started."
              : "Kreirajte prvu aukciju da biste započeli."}
            buttonText={language === "en" ? "Create Auction" : "Kreiraj Aukciju"}
            buttonAction={() => {
              auctionForm.resetForm();
              auctionForm.setIsOpen(true);
            }}
          />
        ) : (
          <>
            <CategoryFilters
              searchQuery={filterSortHook.searchQuery}
              onSearchChange={filterSortHook.setSearchQuery}
              filteredCount={filterSortHook.totalCount}
              selectFilters={filterSortHook.selectFilters}
              placeholder={language === "en" ? "Search auctions..." : "Pretraži aukcije..."}
              itemsFoundText={language === "en" ? "auctions found" : "aukcija pronađeno"}
            />

            {filterSortHook.totalCount === 0 ? (
              <NoSearchFound
                title={language === "en" ? "No matches found" : "Nema rezultata"}
                description={language === "en"
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Pokušajte da prilagodite pretragu ili filtere."}
              />
            ) : (
              <>
                <AuctionList
                  language={language}
                  expandedAuctionIds={expandedAuctionIds}
                  toggleAuctionExpand={toggleAuctionExpand}
                  getAuctionTotalBids={getAuctionTotalBids}
                  getAuctionLots={getAuctionLots}
                  getAuctionCategories={getAuctionCategories}
                  getAuctionLotsWithBids={getAuctionLotsWithBids}
                  auctionActions={auctionActions}
                  auctionForm={auctionForm}
                  expandedContentProps={expandedContentProps}
                  filterSortHook={filterSortHook}
                />
              </>
            )}
          </>
        )
      }

      <AuctionDialogs actions={auctionActions} language={language} auctionForm={auctionForm} />
    </div>
  );
};

export default AdminAuctions;

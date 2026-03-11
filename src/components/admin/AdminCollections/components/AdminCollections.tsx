import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useData, CollectionStatus, Collection } from "@/contexts/DataContext";
import { useCategories } from "@/hooks/useCategories";
import { useCollectionProducts } from "@/hooks/useCollectionProducts";
import { useToast } from "@/hooks/use-toast";
import NoData from "../../AdminComponents/NoData";
import { useServerPaginatedCollections } from "../hooks/useServerPaginatedCollections";
import { useCollectionBulkActions } from "../hooks/useCollectionBulkActions";
import CategoryFilters from "../../AdminCategories/components/CategoryFilters";
import BulkActionsBar from "../../AdminComponents/BulkActionsBar";
import { useCollectionForm } from "../hooks/useCollectionForm";
import { CollectionFormModal } from "./CollectionFormModal";
import TitleHeader from "../../AdminComponents/TitleHeader";
import { CollectionList } from "./CollectionList";
import { useCollectionActions } from "../hooks/useCollectionActions";
import { CollectionDialogs } from "./CollectionDialogs";

const statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[] = [
  { value: "available", labelEn: "Available", labelSr: "Dostupna" },
  { value: "sold", labelEn: "Sold", labelSr: "Prodata" },
  { value: "on_auction", labelEn: "On Auction", labelSr: "Na Aukciji" },
  { value: "withdrawn", labelEn: "Withdrawn", labelSr: "Povučena" },
];

export default function AdminCollections() {
  const { language, t } = useLanguage();
  const { auctions, updateAuction, products } = useData();
  const { collectionProducts } = useCollectionProducts();
  const { categories } = useCategories();
  const { toast } = useToast();

  const [expandedCollections, setExpandedCollections] = useState<number[]>([]);

  const filterSortHook = useServerPaginatedCollections({ language });
  const { allCollections, refresh } = filterSortHook;

  const formHook = useCollectionForm(language, allCollections, products);
  const {
    resetForm,
    setIsOpen,
    handleEdit,
  } = formHook;

  const toggleExpandCollection = (id: number) => {
    setExpandedCollections((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const bulkActionsHook = useCollectionBulkActions({
    collections: allCollections,
    paginatedCollections: filterSortHook.paginatedCollections,
    language,
    auctions,
    updateAuction,
    onSuccess: refresh,
  });

  const actionsHook = useCollectionActions({
    language,
    allCollections,
    auctions,
    updateAuction,
    statusOptions,
    onAuctionDeleteWarningTrigger: () => bulkActionsHook.openBulkDialog("auctionDeleteWarning"),
    onSuccess: refresh,
  });

  const { handleDeleteClick, handleStatusChange } = actionsHook;

  const getStatusBadge = (status: CollectionStatus) => {
    const opt = statusOptions.find((s) => s.value === status);
    const label = language === "en" ? opt?.labelEn : opt?.labelSr;
    const colorClass = status === "available"
      ? "bg-green-500/20 text-green-600 border-green-500/30"
      : status === "on_auction"
        ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
        : "bg-red-500/20 text-red-600 border-red-500/30";
    return <Badge variant="outline" className={colorClass}>{label}</Badge>;
  };

  const getAuctionName = (auctionId: number) => {
    const auction = auctions.find((a) => a.id === auctionId);
    return auction ? auction.title[language] : "-";
  };

  return (
    <div>
      <TitleHeader title={language === "en" ? "Manage Collections" : "Upravljanje Kolekcijama"}>
        <CollectionFormModal language={language} formHook={formHook} />
      </TitleHeader>

      {/* Empty State - No Collections at all */}
      {allCollections.length === 0 ? (
        <NoData
          icon="🗂️"
          title={language === "en" ? "No collections yet" : "Nema kolekcija"}
          description={language === "en"
            ? "Create your first collection to group lots together for auction."
            : "Kreirajte prvu kolekciju da grupišete lotove za aukciju."}
          buttonText={language === "en" ? "Create First Collection" : "Kreiraj Prvu Kolekciju"}
          buttonAction={() => { resetForm(); setIsOpen(true); }}
        />
      ) : (
        <>
          {/* Filters */}
          <CategoryFilters
            selectFilters={filterSortHook.selectFilters}
            searchQuery={filterSortHook.searchQuery}
            onSearchChange={filterSortHook.setSearchQuery}
            filteredCount={filterSortHook.totalCount}
            placeholder={language === "en" ? "Search collections..." : "Pretraži kolekcije..."}
            itemsFoundText={language === "en" ? "collections found" : "pronađene kolekcije"}
          />

          {/* Bulk Actions Bar */}
          <BulkActionsBar
            bulkActions={bulkActionsHook.bulkActions}
            dropDownActions={bulkActionsHook.dropDownActions}
            showBar={bulkActionsHook.showBar}
            totalSelected={bulkActionsHook.totalSelected}
          />

          <CollectionList
            filterSortHook={filterSortHook}
            bulkActionsHook={bulkActionsHook}
            handleEdit={handleEdit}
            handleDeleteClick={handleDeleteClick}
            expandedCollections={expandedCollections}
            toggleExpandCollection={toggleExpandCollection}
            getStatusBadge={getStatusBadge}
            getAuctionName={getAuctionName}
            products={collectionProducts}
            categories={categories}
            statusOptions={statusOptions}
            onStatusChange={handleStatusChange}
            auctions={auctions}
          />
        </>
      )}

      <CollectionDialogs
        language={language}
        actionsHook={actionsHook}
        bulkActionsHook={bulkActionsHook}
        formHook={formHook}
        statusOptions={statusOptions}
        auctions={auctions}
      />
    </div>
  );
};



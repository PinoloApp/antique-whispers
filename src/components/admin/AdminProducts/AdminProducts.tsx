import { useLanguage } from "@/contexts/LanguageContext";
import { useData, LotState, ProductStatus } from "@/contexts/DataContext";
import { useCategories } from "@/hooks/useCategories";
import {
  Loader2,
} from "lucide-react";
import CategoryFilters from "../AdminCategories/components/CategoryFilters";
import BulkActionsBar from "../AdminComponents/BulkActionsBar";
import { useProductForm } from "./hooks/useProductForm";
import { useProductBulkActions } from "./hooks/useProductBulkActions";
import { useAuctionAssignment } from "./hooks/useAuctionAssignment";
import { useProductActions } from "./hooks/useProductActions";
import { ProductDialogs } from "./components/ProductDialogs";
import { ProductFormModal } from "./components/ProductFormModal";
import { ProductList } from "./components/ProductList";
import TitleHeader from "../AdminComponents/TitleHeader";
import NoData from "../AdminComponents/NoData";
import { AuctionAssignmentDialogs } from "./components/AuctionAssignmentDialogs";
import { useServerPaginatedProducts } from "./hooks/useServerPaginatedProducts";

const lotStateOptions: { value: LotState; labelEn: string; labelSr: string }[] = [
  { value: "new", labelEn: "New", labelSr: "Novo" },
  { value: "used", labelEn: "Used", labelSr: "Korišćeno" },
  { value: "refurbished", labelEn: "Refurbished", labelSr: "Obnovljeno" },
  { value: "antique", labelEn: "Antique", labelSr: "Antikvitet" },
  { value: "restored", labelEn: "Restored", labelSr: "Restaurirano" },
];

const statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[] = [
  { value: "available", labelEn: "Available", labelSr: "Dostupan" },
  { value: "sold", labelEn: "Sold", labelSr: "Prodat" },
  { value: "on_auction", labelEn: "On Auction", labelSr: "Na Aukciji" },
  { value: "withdrawn", labelEn: "Withdrawn", labelSr: "Povučen" },
];

const AdminProducts = () => {
  const { language, t } = useLanguage();
  const { auctions, updateAuction } = useData();
  const { categories } = useCategories();
  const filterSortHook = useServerPaginatedProducts({
    language,
    categories,
    auctions,
    statusOptions,
  });
  const { allProducts } = filterSortHook;

  const auctionHook = useAuctionAssignment(language);

  const formHook = useProductForm(language, {
    onSuccessCreate: (product) => {
      auctionHook.checkCategoryAuctionsAndPrompt(product.id, product.category);
    },
    onSuccessUpdate: (product) => {
      if (product.status !== "on_auction") {
        auctionHook.checkCategoryAuctionsAndPrompt(product.id, product.category);
      }
    }
  });

  const { setIsOpen, handleEdit } = formHook;

  const actionsHook = useProductActions({
    language,
    allProducts,
    auctions,
    updateAuction,
    statusOptions,
  });

  const displayProducts = filterSortHook.paginatedProducts;

  const bulkActionsHook = useProductBulkActions({
    allProducts,
    displayProducts,
    language,
    statusOptions,
    auctions,
    updateAuction
  });

  if (filterSortHook.loading && filterSortHook.totalCount === 0 && filterSortHook.statusFilter === "all" && filterSortHook.categoryFilter === "all" && filterSortHook.auctionFilter === "all" && !filterSortHook.searchQuery.trim()) {
    return (
      <div className="flex justify-center items-center flex-1 h-[100vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <TitleHeader title={language === "en" ? "Manage Products" : "Upravljanje Proizvodima"}>
        <ProductFormModal
          language={language}
          categories={categories}
          formHook={formHook}
          lotStateOptions={lotStateOptions}
          onSubmit={formHook.handleSubmit}
        />
      </TitleHeader>

      {(filterSortHook.totalCount > 0 || filterSortHook.paginatedProducts.length > 0 || filterSortHook.searchQuery.trim() || filterSortHook.statusFilter !== "all" || filterSortHook.categoryFilter !== "all" || filterSortHook.auctionFilter !== "all") && (
        <CategoryFilters
          searchQuery={filterSortHook.searchQuery}
          onSearchChange={filterSortHook.setSearchQuery}
          filteredCount={filterSortHook.totalCount}
          selectFilters={filterSortHook.selectFilters}
          placeholder={language === "en" ? "Search by name or lot..." : "Pretraži po imenu ili lotu..."}
          itemsFoundText={language === "en" ? "products found" : "proizvoda pronađeno"}
        />
      )}

      {filterSortHook.totalCount === 0 && filterSortHook.paginatedProducts.length === 0 && !filterSortHook.loading && !filterSortHook.searchQuery.trim() && filterSortHook.statusFilter === "all" && filterSortHook.categoryFilter === "all" && filterSortHook.auctionFilter === "all" ? (
        <NoData
          icon="📂"
          title={language === "en" ? "No products yet" : "Nema proizvoda"}
          description={language === "en"
            ? "Create your first product to get started."
            : "Kreirajte prvi proizvod da biste započeli."}
          buttonText={language === "en" ? "Add Product" : "Dodaj Proizvod"}
          buttonAction={() => { setIsOpen(true) }}
        />
      ) : (
        <>
          <BulkActionsBar
            bulkActions={bulkActionsHook.bulkActions}
            showBar={bulkActionsHook.showBar}
            totalSelected={bulkActionsHook.totalNumSelected}
            dropDownActions={bulkActionsHook.dropDownActions}
          />

          <ProductList
            filterSortHook={filterSortHook}
            bulkActionsHook={bulkActionsHook}
            actionsHook={actionsHook}
            handleEdit={handleEdit}
            displayProducts={displayProducts}
            categories={categories}
            statusOptions={statusOptions}
            language={language}
          />
        </>
      )}
      <AuctionAssignmentDialogs language={language} auctionHook={auctionHook} />
      <ProductDialogs
        language={language}
        formHook={formHook}
        bulkActionsHook={bulkActionsHook}
        actionsHook={actionsHook}
        statusOptions={statusOptions}
        auctions={auctions}
      />
    </div>
  );
};

export default AdminProducts;

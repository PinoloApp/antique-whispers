import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext";
import { useProducts } from "@/hooks/useProducts";
import { useCategoryForm } from "../hooks/useCategoryForm";
import { useServerPaginatedCategories } from "../hooks/useServerPaginatedCategories";
import { useCategoryBulkActions } from "../hooks/useCategoryBulkActions";
import { useCategoryActions } from "../hooks/useCategoryActions";
import CategoryFilters from "./CategoryFilters";
import { CategoryFormModal } from "./CategoryFormModal";
import { CategoryDialogs } from "./CategoryDialogs";
import { CategoryList } from "./CategoryList";
import TitleHeader from "../../AdminComponents/TitleHeader";
import NoData from "../../AdminComponents/NoData";
import BulkActionsBar from "../../AdminComponents/BulkActionsBar";
import { Loader2 } from "lucide-react";

const AdminCategories = () => {
  const { language, t } = useLanguage();
  const { collections } = useData();
  const { products } = useProducts();

  const collectionProductIds = new Set(collections.flatMap((c) => c.productIds));
  const standaloneLots = products.filter((p) => !collectionProductIds.has(p.id));

  const filterSortHook = useServerPaginatedCategories({ language });
  const { allCategories, refresh } = filterSortHook;

  const formHook = useCategoryForm(language, allCategories);
  const bulkActionsHook = useCategoryBulkActions({ categories: allCategories, language, onSuccess: refresh });
  const actionsHook = useCategoryActions(language, allCategories, refresh);

  const { handleEdit, setIsOpen } = formHook;

  if (filterSortHook.loading && filterSortHook.allCategories.length === 0 && !filterSortHook.searchQuery.trim() && filterSortHook.statusFilter === "all") {
    return (
      <div className="flex justify-center items-center flex-1 h-[100vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col">
        <TitleHeader title={t("manageCategories")}>
          <CategoryFormModal language={language} formHook={formHook} />
        </TitleHeader>

        {(filterSortHook.totalCount > 0 || filterSortHook.paginatedCategories.length > 0 || filterSortHook.searchQuery.trim() || filterSortHook.statusFilter !== "all") && (
          <CategoryFilters
            searchQuery={filterSortHook.searchQuery}
            onSearchChange={filterSortHook.handleSearchChange}
            filteredCount={filterSortHook.totalCount}
            selectFilters={filterSortHook.selectFilters}
            placeholder={t("searchCategories")}
            itemsFoundText={t("categoriesFound")}
          />
        )}
      </div>

      {filterSortHook.totalCount === 0 && filterSortHook.paginatedCategories.length === 0 && !filterSortHook.loading && !filterSortHook.searchQuery.trim() && filterSortHook.statusFilter === "all" ? (
        <NoData
          icon="📂"
          title={t("noCategoriesYet")}
          description={t("youHaventCreatedAnyCategoriesYet")}
          buttonText={t("addFirstCategory")}
          buttonAction={() => setIsOpen(true)}
        />
      ) : (
        <>
          <BulkActionsBar
            bulkActions={bulkActionsHook.bulkActions}
            showBar={bulkActionsHook.showBar}
            totalSelected={bulkActionsHook.totalSelected}
          />

          <CategoryList
            filterSortHook={filterSortHook}
            bulkActionsHook={bulkActionsHook}
            actionsHook={actionsHook}
            handleEdit={handleEdit}
            categories={allCategories}
            standaloneLots={standaloneLots}
            collections={collections}
          />
        </>
      )}

      <CategoryDialogs
        language={language}
        categories={allCategories}
        actionsHook={actionsHook}
        bulkActionsHook={bulkActionsHook}
      />
    </div>
  );
};

export default AdminCategories;

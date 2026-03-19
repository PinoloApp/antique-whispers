import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Category, Product, Collection } from "@/contexts/DataContext";
import { useServerPaginatedCategories } from "../hooks/useServerPaginatedCategories";
import { useCategoryBulkActions } from "../hooks/useCategoryBulkActions";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { CategoryMobileCard } from "./CategoryMobileCard";
import { CategoryTableRow } from "./CategoryTableRow";
import { useLanguage } from "@/contexts/LanguageContext";
import NoSearchFound from "../../AdminComponents/filters/NoSearchFound";
import PaginationControls from "../../AdminComponents/Pagination";
import { getPaginationLabel } from "@/utils/adminUsers.utils";
import Table from "../../AdminComponents/Table";

interface CategoryListProps {
    filterSortHook: ReturnType<typeof useServerPaginatedCategories>;
    bulkActionsHook: ReturnType<typeof useCategoryBulkActions>;
    actionsHook: ReturnType<typeof useCategoryActions>;
    handleEdit: (category: Category) => void;
    categories: Category[];
    standaloneLots: Product[];
    collections: Collection[];
}

export const CategoryList: React.FC<CategoryListProps> = ({
    filterSortHook,
    bulkActionsHook,
    actionsHook,
    handleEdit,
    categories,
    standaloneLots,
    collections,
}) => {
    const {
        paginatedCategories,
        filteredAndSortedCategories,
        searchQuery,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        totalPages,
        totalCount,
        startIndex,
        endIndex,
        handleItemsPerPageChange,
    } = filterSortHook;

    const { t, language } = useLanguage();

    const {
        selectedCategories,
        selectedInactiveCategories,
        handleSelectCategory,
        handleSelectAll,
        handleSelectInactiveCategory,
        handleSelectAllInactive,
    } = bulkActionsHook;

    const {
        expandedCategories,
        toggleCategoryExpanded,
        handleToggleCategoryActive,
        handleDeleteClick,
        handleMoveSubcategory,
        handleToggleSubcategoryActive,
    } = actionsHook;

    if (totalCount === 0) {
        const title = t("noCriteriaFoundTitle");
        const description = searchQuery.trim() !== ""
            ? `${t("noCriteriaFoundDesc")} "${searchQuery}".`
            : t("tryAdjustingSearch");

        return (
            <NoSearchFound
                title={title}
                description={description}
            />
        );
    }

    const getHasMatchingSubcategory = (category: Category) => {
        return (
            searchQuery.trim() !== "" &&
            category.subcategories.some(
                (sub) =>
                    sub.title.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sub.title.sr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sub.description.en.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sub.description.sr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    sub.id.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        );
    };

    const isAllSelected =
        paginatedCategories.length > 0 &&
        paginatedCategories.every((c) =>
            c.isActive ? selectedCategories.includes(c.id) : selectedInactiveCategories.includes(c.id)
        );

    const handleSelectAllChange = (checked: boolean) => {
        const pageActiveIds = paginatedCategories.filter((c) => c.isActive).map((c) => c.id);
        const pageInactiveIds = paginatedCategories.filter((c) => !c.isActive).map((c) => c.id);
        handleSelectAll(checked, pageActiveIds);
        handleSelectAllInactive(checked, pageInactiveIds);
    };

    const TABLE_COLUMNS = [
        { key: "category", label: { en: "Category", sr: "Kategorija" }, align: "text-left" },
        { key: "status", label: { en: "Status", sr: "Status" }, align: "text-center" },
        { key: "subcategories", label: { en: "Subcategories", sr: "Podkategorije" }, align: "text-center" },
        { key: "lots", label: { en: "Lots", sr: "Lotovi" }, align: "text-center" },
        { key: "collections", label: { en: "Collections", sr: "Kolekcije" }, align: "text-center" },
        { key: "actions", label: { en: "Actions", sr: "Akcije" }, align: "text-right" },
    ];

    return (
        <>
            <div className="md:hidden space-y-4">
                {paginatedCategories.length > 0 && (
                    <div className="flex items-center gap-2 px-1 pb-2">
                        <Checkbox
                            checked={isAllSelected}
                            onCheckedChange={handleSelectAllChange}
                            id="mobile-select-all"
                        />
                        <label
                            htmlFor="mobile-select-all"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {language === "en" ? "Select All" : "Izaberi sve"}
                        </label>
                    </div>
                )}
                {paginatedCategories.map((category) => {
                    const hasMatchingSubcategory = getHasMatchingSubcategory(category);
                    const isSelected = category.isActive
                        ? selectedCategories.includes(category.id)
                        : selectedInactiveCategories.includes(category.id);

                    return (
                        <CategoryMobileCard
                            key={category.id}
                            category={category}
                            language={language}
                            searchQuery={searchQuery}
                            isSelected={isSelected}
                            isExpanded={expandedCategories.includes(category.id) || hasMatchingSubcategory}
                            hasMatchingSubcategory={hasMatchingSubcategory}
                            standaloneLots={standaloneLots}
                            collections={collections}
                            onSelect={(id, checked, isActive) =>
                                isActive ? handleSelectCategory(id, checked) : handleSelectInactiveCategory(id, checked)
                            }
                            onToggleExpand={toggleCategoryExpanded}
                            onEdit={handleEdit}
                            onToggleActive={handleToggleCategoryActive}
                            onDelete={handleDeleteClick}
                            onMoveSubcategory={handleMoveSubcategory}
                            onToggleSubcategoryActive={handleToggleSubcategoryActive}
                        />
                    );
                })}
            </div>

            <Table
                TABLE_COLUMNS={TABLE_COLUMNS}
                isAllSelected={isAllSelected}
                handleSelectAllChange={handleSelectAllChange}
                language={language}
            >
                <tbody className="divide-y divide-border">
                    {paginatedCategories.map((category) => {
                        const hasMatchingSubcategory = getHasMatchingSubcategory(category);
                        const isSelected = category.isActive
                            ? selectedCategories.includes(category.id)
                            : selectedInactiveCategories.includes(category.id);

                        return (
                            <CategoryTableRow
                                key={category.id}
                                category={category}
                                language={language}
                                searchQuery={searchQuery}
                                isSelected={isSelected}
                                isExpanded={expandedCategories.includes(category.id) || hasMatchingSubcategory}
                                standaloneLots={standaloneLots}
                                collections={collections}
                                onSelect={(id, checked, isActive) =>
                                    isActive ? handleSelectCategory(id, checked) : handleSelectInactiveCategory(id, checked)
                                }
                                onToggleExpand={toggleCategoryExpanded}
                                onEdit={handleEdit}
                                onToggleActive={handleToggleCategoryActive}
                                onDelete={handleDeleteClick}
                                onMoveSubcategory={handleMoveSubcategory}
                                onToggleSubcategoryActive={handleToggleSubcategoryActive}
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
                paginationLabel={getPaginationLabel(startIndex, endIndex, totalCount, language === "en" ? "categories" : "kategorija", t)}
            />
        </>
    );
};

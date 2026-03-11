import React from "react";
import { Product, Category, ProductStatus, Auction } from "@/contexts/DataContext";
import { useServerPaginatedProducts } from "../hooks/useServerPaginatedProducts";
import { useProductBulkActions } from "../hooks/useProductBulkActions";
import { ProductMobileCard } from "./ProductMobileCard";
import { ProductTableRow } from "./ProductTableRow";
import NoSearchFound from "../../AdminComponents/filters/NoSearchFound";
import PaginationControls from "../../AdminComponents/Pagination";
import { getPaginationLabel } from "@/utils/adminUsers.utils";
import AdminTable from "../../AdminComponents/Table";
import { useLanguage } from "@/contexts/LanguageContext";

import { useProductActions } from "../hooks/useProductActions";

interface ProductListProps {
    filterSortHook: ReturnType<typeof useServerPaginatedProducts>;
    bulkActionsHook: ReturnType<typeof useProductBulkActions>;
    actionsHook: ReturnType<typeof useProductActions>;
    handleEdit: (product: Product) => void;
    displayProducts: Product[];
    categories: Category[];
    statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[];
    language: "en" | "sr";
    auctions: Auction[];
}

export const ProductList: React.FC<ProductListProps> = ({
    filterSortHook,
    bulkActionsHook,
    actionsHook,
    handleEdit,
    displayProducts,
    categories,
    statusOptions,
    language,
    auctions,
}) => {
    const { t } = useLanguage();
    const { handleDeleteClick, handleInlineStatusChange } = actionsHook;

    const {
        searchQuery,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        totalCount,
        startIndex,
        filteredProducts,
    } = filterSortHook;

    const {
        selectedProducts,
        toggleSelectProduct,
        toggleSelectAll,
    } = bulkActionsHook;

    const TABLE_COLUMNS = [
        { key: "lotNumber", label: { en: "Lot", sr: "Lot" }, align: "text-left" },
        { key: "product", label: { en: "Product", sr: "Proizvod" }, align: "text-left" },
        { key: "category", label: { en: "Category", sr: "Kategorija" }, align: "text-left" },
        { key: "status", label: { en: "Status", sr: "Status" }, align: "text-left" },
        { key: "startingPrice", label: { en: "Starting Price", sr: "Početna cena" }, align: "text-left" },
        { key: "actions", label: { en: "Actions", sr: "Akcije" }, align: "text-right" },
    ];

    if (totalCount === 0) {
        const title = t("noProductsFoundTitle");
        const description = searchQuery.trim() !== ""
            ? `${t("noProductsFoundDesc")} "${searchQuery}".`
            : t("tryAdjustingSearch");

        return (
            <NoSearchFound
                title={title}
                description={description}
            />
        );
    }

    if (displayProducts.length === 0 && !searchQuery) {
        // Handled by the parent component (NoData component) but fallback here
        return null;
    }

    const isAllSelected = displayProducts.length > 0 && displayProducts.every((p) => selectedProducts.includes(p.id));

    return (
        <>
            <div className="md:hidden space-y-4">
                {displayProducts.map((product) => (
                    <ProductMobileCard
                        key={product.id}
                        product={product}
                        language={language}
                        isSelected={selectedProducts.includes(product.id)}
                        categories={categories}
                        statusOptions={statusOptions}
                        onSelect={toggleSelectProduct}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleInlineStatusChange}
                        auctions={auctions}
                    />
                ))}
            </div>

            <AdminTable
                TABLE_COLUMNS={TABLE_COLUMNS}
                isAllSelected={isAllSelected}
                handleSelectAllChange={toggleSelectAll}
                language={language}
            >
                <tbody className="divide-y divide-border">
                    {displayProducts.map((product) => (
                        <ProductTableRow
                            key={product.id}
                            product={product}
                            language={language}
                            isSelected={selectedProducts.includes(product.id)}
                            categories={categories}
                            statusOptions={statusOptions}
                            onSelect={toggleSelectProduct}
                            onEdit={handleEdit}
                            onDelete={handleDeleteClick}
                            onStatusChange={handleInlineStatusChange}
                            auctions={auctions}
                        />
                    ))}
                </tbody>
            </AdminTable>

            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                perPageLabel={t("perPage")}
                paginationLabel={getPaginationLabel(
                    startIndex,
                    startIndex + itemsPerPage,
                    filteredProducts.length,
                    language === "en" ? "products" : "proizvoda",
                    t
                )}
            />
        </>
    );
};

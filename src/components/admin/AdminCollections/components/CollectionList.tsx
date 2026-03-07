import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collection, Product, Category, CollectionStatus } from "@/contexts/DataContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useServerPaginatedCollections } from "../hooks/useServerPaginatedCollections";
import { useCollectionBulkActions } from "../hooks/useCollectionBulkActions";
import { CollectionTableRow } from "./CollectionTableRow";
import AdminTable from "../../AdminComponents/Table";
import PaginationControls from "../../AdminComponents/Pagination";
import NoSearchFound from "../../AdminComponents/filters/NoSearchFound";
import { getPaginationLabel } from "@/utils/adminUsers.utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CollectionListProps {
    filterSortHook: ReturnType<typeof useServerPaginatedCollections>;
    bulkActionsHook: ReturnType<typeof useCollectionBulkActions>;
    handleEdit: (collection: Collection) => void;
    handleDeleteClick: (id: number) => void;
    expandedCollections: number[];
    toggleExpandCollection: (id: number) => void;
    getStatusBadge: (status: CollectionStatus) => React.ReactNode;
    getAuctionName: (id: number) => string;
    products: Product[];
    categories: Category[];
    statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[];
    onStatusChange: (collection: Collection, newStatus: CollectionStatus) => void;
}

export const CollectionList: React.FC<CollectionListProps> = ({
    filterSortHook,
    bulkActionsHook,
    handleEdit,
    handleDeleteClick,
    expandedCollections,
    toggleExpandCollection,
    getStatusBadge,
    getAuctionName,
    products,
    categories,
    statusOptions,
    onStatusChange,
}) => {
    const { language, t } = useLanguage();

    const {
        paginatedCollections,
        totalCount,
        currentPage,
        setCurrentPage,
        itemsPerPage,
        setItemsPerPage,
        totalPages,
        startIndex,
        searchQuery,
    } = filterSortHook;

    const {
        selectedCollections,
        toggleSelectCollection,
        toggleSelectAll,
    } = bulkActionsHook;

    const TABLE_COLUMNS = [
        { key: "name", label: { en: "Name", sr: "Naziv" }, align: "text-left" },
        { key: "lotNumber", label: { en: "Lot #", sr: "Lot br." }, align: "text-left" },
        { key: "category", label: { en: "Category", sr: "Kategorija" }, align: "text-left" },
        { key: "status", label: { en: "Status", sr: "Status" }, align: "text-left" },
        { key: "startingPrice", label: { en: "Starting Price", sr: "Početna Cena" }, align: "text-left" },
        { key: "lots", label: { en: "Lots", sr: "Lotovi" }, align: "text-left" },
        { key: "actions", label: { en: "Actions", sr: "Akcije" }, align: "text-right" },
    ];

    if (paginatedCollections.length === 0) {
        const title = t("noCollectionsFoundTitle");
        const description = searchQuery.trim() !== ""
            ? `${t("noCollectionsFoundDesc")} "${searchQuery}".`
            : t("tryAdjustingSearch");

        return (
            <NoSearchFound
                title={title}
                description={description}
            />
        );
    }

    return (
        <>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {paginatedCollections.map((collection) => (
                    <div key={collection.id} className={`bg-card border border-border rounded-lg p-4 space-y-3 ${selectedCollections.includes(collection.id) ? "ring-2 ring-primary" : ""}`}>
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <Checkbox
                                    checked={selectedCollections.includes(collection.id)}
                                    onCheckedChange={() => toggleSelectCollection(collection.id)}
                                    className="mt-1 shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="font-medium text-foreground truncate">{collection.name[language]}</p>
                                    <p className="text-xs text-muted-foreground">{collection.lotNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleEdit(collection)}>
                                            <Pencil className="w-4 h-4 mr-2" />
                                            {language === "en" ? "Edit" : "Izmeni"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleDeleteClick(collection.id)}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {language === "en" ? "Delete" : "Obriši"}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="col-span-2">
                                <span className="text-muted-foreground text-xs block mb-1">{language === "en" ? "Status:" : "Status:"}</span>{" "}
                                <Select
                                    value={collection.status}
                                    onValueChange={(value) => onStatusChange(collection, value as CollectionStatus)}
                                >
                                    <SelectTrigger
                                        className={`w-full h-8 text-xs ${collection.status === "available"
                                            ? "bg-green-500/20 text-green-600 border-green-500/30"
                                            : collection.status === "sold"
                                                ? "bg-red-500/20 text-red-600 border-red-500/30"
                                                : collection.status === "withdrawn"
                                                    ? "bg-blue-500/20 text-blue-600 border-blue-500/30"
                                                    : "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
                                            }`}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statusOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value} disabled={opt.value === "on_auction"}>
                                                {language === "en" ? opt.labelEn : opt.labelSr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Starting:" : "Početna:"}</span>{" "}
                                <span className="font-medium">€{collection.startingPrice.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Category:" : "Kategorija:"}</span>{" "}
                                <span className="font-medium">{(() => { const cat = categories.find((c) => c.id === collection.category); return cat ? cat.title[language] : "-"; })()}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Lots:" : "Lotovi:"}</span>{" "}
                                <span className="font-medium">{collection.productIds.length}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{language === "en" ? "Auction:" : "Aukcija:"}</span>{" "}
                                <span className="font-medium">{getAuctionName(collection.auctionId)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <AdminTable
                TABLE_COLUMNS={TABLE_COLUMNS}
                isAllSelected={paginatedCollections.length > 0 && paginatedCollections.every((c) => selectedCollections.includes(c.id))}
                handleSelectAllChange={toggleSelectAll}
                language={language}
            >
                <tbody className="divide-y divide-border">
                    {paginatedCollections.map((collection) => {
                        const isExpanded = expandedCollections.includes(collection.id);
                        const collectionProducts = collection.productIds.map((pid) => products.find((p) => p.id === pid));
                        return (
                            <CollectionTableRow
                                key={collection.id}
                                collection={collection}
                                language={language}
                                isSelected={selectedCollections.includes(collection.id)}
                                isExpanded={isExpanded}
                                collectionProducts={collectionProducts}
                                categories={categories}
                                statusOptions={statusOptions}
                                onStatusChange={onStatusChange}
                                onSelect={toggleSelectCollection}
                                onToggleExpand={toggleExpandCollection}
                                onEdit={handleEdit}
                                onDelete={handleDeleteClick}
                            />
                        );
                    })}
                </tbody>
            </AdminTable>

            {/* Pagination */}
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                perPageLabel={t("perPage")}
                paginationLabel={getPaginationLabel(startIndex, Math.min(startIndex + itemsPerPage, totalCount), totalCount, language === "en" ? "collections" : "kolekcija", t)}
            />
        </>
    );
};

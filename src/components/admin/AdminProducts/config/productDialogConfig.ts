import { useProductActions } from "../hooks/useProductActions";
import { useProductBulkActions } from "../hooks/useProductBulkActions";
import {
    ProductDialogKey,
    ProductStaticDialogKey,
    ProductDialogConfig,
} from "./productDialogTypes";
import { PRODUCT_DIALOG_I18N } from "./productDialogI18n";
import { Trash2, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Auction, ProductStatus } from "@/contexts/DataContext";

type ProductActions = ReturnType<typeof useProductActions>;
type ProductBulkActions = ReturnType<typeof useProductBulkActions>;

export const buildProductDialogConfig = (
    language: "en" | "sr",
    actions: ProductActions,
    bulkActions: ProductBulkActions,
    statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[],
    auctions: Auction[]
): Partial<Record<ProductDialogKey, ProductDialogConfig>> => {
    const {
        handleDeleteConfirm,
        handleConfirmInlineStatusChange,
        executeStatusChange,
        pendingStatusChange,
    } = actions;

    const {
        handleBulkDeleteConfirm,
        handleBulkStatusConfirm,
        getDeletableProducts,
        selectedProducts,
        bulkStatus,
    } = bulkActions;

    const configs: Partial<Record<ProductDialogKey, ProductDialogConfig>> = {
        delete: {
            ...PRODUCT_DIALOG_I18N.delete[language],
            onAction: handleDeleteConfirm,
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            icon: Trash2,
        },
        bulkDelete: {
            title: PRODUCT_DIALOG_I18N.bulkDelete[language].title,
            description: (() => {
                const deletable = getDeletableProducts();
                const skippedCount = selectedProducts.length - deletable.length;
                if (language === "en") {
                    return `${deletable.length} of ${selectedProducts.length} products will be deleted.${skippedCount > 0 ? ` ${skippedCount} products on auction will be skipped.` : ""} This action cannot be undone.`;
                }
                return `${deletable.length} od ${selectedProducts.length} proizvoda će biti obrisano.${skippedCount > 0 ? ` ${skippedCount} proizvoda na aukciji će biti preskočeno.` : ""} Ova akcija se ne može poništiti.`;
            })(),
            actionText: PRODUCT_DIALOG_I18N.bulkDelete[language].actionText,
            onAction: handleBulkDeleteConfirm,
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            icon: Trash2,
        },
        bulkStatus: {
            title: PRODUCT_DIALOG_I18N.bulkStatus[language].title,
            description: language === "en"
                ? `You are about to change the status of ${selectedProducts.length} products to "${statusOptions.find((o) => o.value === bulkStatus)?.labelEn}".`
                : `Upravo ćete promeniti status ${selectedProducts.length} proizvoda u "${statusOptions.find((o) => o.value === bulkStatus)?.labelSr}".`,
            actionText: PRODUCT_DIALOG_I18N.bulkStatus[language].actionText,
            onAction: handleBulkStatusConfirm,
            icon: Info,
        },
        inlineStatus: {
            title: PRODUCT_DIALOG_I18N.inlineStatus[language].title,
            description: language === "en"
                ? `Change status of "${pendingStatusChange?.product.name}" from "${statusOptions.find((o) => o.value === pendingStatusChange?.product.status)?.labelEn}" to "${statusOptions.find((o) => o.value === pendingStatusChange?.newStatus)?.labelEn}"?`
                : `Promeniti status proizvoda "${pendingStatusChange?.product.namesr}" iz "${statusOptions.find((o) => o.value === pendingStatusChange?.product.status)?.labelSr}" u "${statusOptions.find((o) => o.value === pendingStatusChange?.newStatus)?.labelSr}"?`,
            actionText: PRODUCT_DIALOG_I18N.inlineStatus[language].actionText,
            onAction: handleConfirmInlineStatusChange,
            icon: Info,
        },
        auctionRemoval: {
            title: PRODUCT_DIALOG_I18N.auctionRemoval[language].title,
            description: (() => {
                if (!pendingStatusChange) return "";
                const parentAuction = auctions.find((a) => a.lotIds.includes(pendingStatusChange.product.id));
                const auctionName = parentAuction ? (language === "en" ? parentAuction.title.en : parentAuction.title.sr) : "";
                const productName = language === "en" ? pendingStatusChange.product.name : pendingStatusChange.product.namesr;
                return language === "en"
                    ? `"${productName}" will be removed from auction "${auctionName}". This action cannot be undone.`
                    : `"${productName}" će biti uklonjen sa aukcije "${auctionName}". Ova akcija se ne može poništiti.`;
            })(),
            actionText: PRODUCT_DIALOG_I18N.auctionRemoval[language].actionText,
            onAction: executeStatusChange,
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            icon: AlertTriangle,
        },
        auctionDeleteWarning: {
            ...PRODUCT_DIALOG_I18N.auctionDeleteWarning[language],
            onAction: () => actions.closeDialog(),
            icon: AlertCircle,
        }
    };

    return configs;
};

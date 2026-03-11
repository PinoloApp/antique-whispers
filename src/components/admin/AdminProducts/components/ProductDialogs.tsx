import React from "react";
import { ProductStatus, Auction } from "@/contexts/DataContext";
import { useProductForm } from "../hooks/useProductForm";
import { useProductBulkActions } from "../hooks/useProductBulkActions";
import { useProductActions } from "../hooks/useProductActions";
import ReusableAlertDialog from "@/components/admin/AdminUsers/ReusableAlertDialog";
import { buildProductDialogConfig } from "../config/productDialogConfig";

interface ProductDialogsProps {
    language: "en" | "sr";
    formHook: ReturnType<typeof useProductForm>;
    bulkActionsHook: ReturnType<typeof useProductBulkActions>;
    actionsHook: ReturnType<typeof useProductActions>;
    statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[];
    auctions: Auction[];
}

export const ProductDialogs: React.FC<ProductDialogsProps> = ({
    language,
    bulkActionsHook,
    actionsHook,
    statusOptions,
    auctions,
}) => {
    const {
        activeDialog,
        closeDialog,
    } = actionsHook;

    const {
        activeBulkDialog,
        closeBulkDialog,
    } = bulkActionsHook;

    const dialogConfig = buildProductDialogConfig(
        language,
        actionsHook,
        bulkActionsHook,
        statusOptions,
        auctions
    );

    const currentDialogKey = activeBulkDialog || activeDialog;
    const currentConfig = currentDialogKey && dialogConfig[currentDialogKey] ? dialogConfig[currentDialogKey] : null;

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            if (activeBulkDialog) closeBulkDialog();
            if (activeDialog) closeDialog();
        }
    };

    return (
        <ReusableAlertDialog
            open={!!currentConfig}
            onOpenChange={handleOpenChange}
            title={currentConfig?.title || ""}
            description={currentConfig?.description || ""}
            onAction={currentConfig?.onAction || (() => { })}
            actionText={currentConfig?.actionText || ""}
            actionClassName={currentConfig?.actionClassName}
            cancelText={currentConfig?.cancelText}
            icon={currentConfig?.icon}
            isMutating={actionsHook.isMutating || bulkActionsHook.isMutating}
        />
    );
};

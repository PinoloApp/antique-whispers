import React from "react";
import { CollectionStatus, Auction } from "@/contexts/DataContext";
import { useCollectionActions } from "../hooks/useCollectionActions";
import { useCollectionBulkActions } from "../hooks/useCollectionBulkActions";
import ReusableAlertDialog from "@/components/admin/AdminUsers/ReusableAlertDialog";
import { buildCollectionDialogConfig } from "../config/collectionDialogConfig";
import { useCollectionForm } from "../hooks/useCollectionForm";

interface CollectionDialogsProps {
    language: "en" | "sr";
    actionsHook: ReturnType<typeof useCollectionActions>;
    bulkActionsHook: ReturnType<typeof useCollectionBulkActions>;
    formHook: ReturnType<typeof useCollectionForm>;
    statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[];
    auctions: Auction[];
}

export const CollectionDialogs: React.FC<CollectionDialogsProps> = ({
    language,
    actionsHook,
    bulkActionsHook,
    formHook,
    statusOptions,
    auctions,
}) => {
    const { activeDialog, closeDialog, isMutating: isActionMutating } = actionsHook;
    const { activeBulkDialog, closeBulkDialog, isMutating: isBulkMutating } = bulkActionsHook;
    const { createDialogOpen, setCreateDialogOpen, handleCreateConfirm, updateDialogOpen, setUpdateDialogOpen, handleUpdateConfirm } = formHook;

    const dialogConfig = buildCollectionDialogConfig(
        language,
        actionsHook,
        bulkActionsHook,
        statusOptions,
        auctions
    );

    // Merge form dialogs into unified renderer if possible
    const currentDialogKey = activeBulkDialog || activeDialog;

    // Handle form dialogs separately for now since they are already in useCollectionForm
    // or we could bridge them. Let's bridge them for cleaner UI.

    const handleOpenChange = (open: boolean) => {
        if (!open && !isActionMutating && !isBulkMutating) {
            if (activeBulkDialog) closeBulkDialog();
            if (activeDialog) closeDialog();
            if (createDialogOpen) setCreateDialogOpen(false);
            if (updateDialogOpen) setUpdateDialogOpen(false);
        }
    };

    let currentConfig = currentDialogKey ? dialogConfig[currentDialogKey] : undefined;
    let isOpen = !!currentConfig;

    if (createDialogOpen) {
        currentConfig = dialogConfig.create;
        if (currentConfig) {
            currentConfig.onAction = handleCreateConfirm;
            isOpen = true;
        }
    } else if (updateDialogOpen) {
        currentConfig = dialogConfig.update;
        if (currentConfig) {
            currentConfig.onAction = handleUpdateConfirm;
            isOpen = true;
        }
    }

    return (
        <ReusableAlertDialog
            open={isOpen}
            onOpenChange={handleOpenChange}
            title={currentConfig?.title || ""}
            description={currentConfig?.description || ""}
            onAction={currentConfig?.onAction || (() => { })}
            actionText={currentConfig?.actionText || ""}
            actionClassName={currentConfig?.actionClassName}
            cancelText={currentConfig?.cancelText}
            isMutating={isActionMutating || isBulkMutating}
            icon={currentConfig?.icon}
        />
    );
};

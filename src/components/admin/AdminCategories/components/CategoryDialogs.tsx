import React from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { useCategoryActions } from "../hooks/useCategoryActions";
import { useCategoryBulkActions } from "../hooks/useCategoryBulkActions";
import { Category } from "@/contexts/DataContext";
import ReusableAlertDialog from "@/components/admin/AdminUsers/ReusableAlertDialog";
import { buildCategoryDialogConfig } from "../config/categoryDialogConfig";

interface CategoryDialogsProps {
    language: "en" | "sr";
    categories: Category[];
    actionsHook: ReturnType<typeof useCategoryActions>;
    bulkActionsHook: ReturnType<typeof useCategoryBulkActions>;
}

export const CategoryDialogs: React.FC<CategoryDialogsProps> = ({
    language,
    categories,
    actionsHook,
    bulkActionsHook,
}) => {
    const {
        activeDialog,
        closeDialog,
        subcategoryToMove,
        targetCategoryId,
        setTargetCategoryId,
        confirmMoveSubcategory,
    } = actionsHook;

    const {
        activeBulkDialog,
        closeBulkDialog,
        isMutating: isBulkMutating,
    } = bulkActionsHook;

    const dialogConfig = buildCategoryDialogConfig(language, actionsHook, bulkActionsHook);

    // Prefer bulk dialog if both are active (though they shouldn't be)
    const currentDialogKey = activeBulkDialog || activeDialog;
    const currentConfig = currentDialogKey && dialogConfig[currentDialogKey] ? dialogConfig[currentDialogKey] : null;

    const handleOpenChange = (open: boolean) => {
        if (!open && !actionsHook.isMutating && !isBulkMutating) {
            if (activeBulkDialog) closeBulkDialog();
            if (activeDialog) closeDialog();
        }
    };

    return (
        <>
            {/* Generic ReusableAlertDialog Renderer */}
            <ReusableAlertDialog
                open={!!currentConfig && currentDialogKey !== "moveSubcategory"}
                onOpenChange={handleOpenChange}
                title={currentConfig?.title || ""}
                description={currentConfig?.description || ""}
                onAction={currentConfig?.onAction || (() => { })}
                actionText={currentConfig?.actionText || ""}
                actionClassName={currentConfig?.actionClassName}
                cancelText={currentConfig?.cancelText}
                isMutating={actionsHook.isMutating || isBulkMutating}
                icon={currentConfig?.icon}
            />

            {/* Move Subcategory Dialog (Custom) */}
            <Dialog open={activeDialog === "moveSubcategory"} onOpenChange={(open) => !open && closeDialog()}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>{language === "en" ? "Move Subcategory" : "Premesti Podkategoriju"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {language === "en"
                                ? `Select the target category for "${subcategoryToMove?.sub.description.en}":`
                                : `Izaberite ciljnu kategoriju za "${subcategoryToMove?.sub.description.sr}":`}
                        </p>
                        <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
                            <SelectTrigger>
                                <SelectValue placeholder={language === "en" ? "Select category" : "Izaberite kategoriju"} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories
                                    .filter((c) => c.id !== subcategoryToMove?.fromCategoryId && c.isActive)
                                    .map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.title[language]}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => closeDialog()} disabled={actionsHook.isMutating}>
                                {language === "en" ? "Cancel" : "Otkaži"}
                            </Button>
                            <Button onClick={confirmMoveSubcategory} disabled={!targetCategoryId || actionsHook.isMutating}>
                                {actionsHook.isMutating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                {actionsHook.isMutating
                                    ? (language === "en" ? "Moving..." : "Premeštanje...")
                                    : (language === "en" ? "Move" : "Premesti")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

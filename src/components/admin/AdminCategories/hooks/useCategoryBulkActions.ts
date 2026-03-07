import { useMemo, useState } from "react";
import { Category, useData } from "@/contexts/DataContext";
import { CategoryService } from "@/services/categoryService";
import { useToast } from "@/hooks/use-toast";
import { isCategoryInActiveAuction } from "../utils/categoryUtils";
import { Power, PowerOff, Trash2 } from "lucide-react";
import { CategoryDialogKey } from "../config/categoryDialogTypes";

interface UseCategoryBulkActionsProps {
    categories: Category[];
    language: "en" | "sr";
}

export const useCategoryBulkActions = ({ categories, language }: UseCategoryBulkActionsProps) => {
    const { auctions, products, collections } = useData();
    const { toast } = useToast();

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedInactiveCategories, setSelectedInactiveCategories] = useState<string[]>([]);
    const [activeBulkDialog, setActiveBulkDialog] = useState<CategoryDialogKey | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openBulkDialog = (type: CategoryDialogKey) => setActiveBulkDialog(type);
    const closeBulkDialog = () => setActiveBulkDialog(null);

    const handleSelectCategory = (categoryId: string, checked: boolean) => {
        if (checked) {
            setSelectedCategories((prev) => [...prev, categoryId]);
        } else {
            setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
        }
    };

    const handleSelectAll = (checked: boolean, activeCategoriesIds: string[]) => {
        if (checked) {
            setSelectedCategories((prev) => {
                const newIds = activeCategoriesIds.filter((id) => !prev.includes(id));
                return [...prev, ...newIds];
            });
        } else {
            const idsToRemove = new Set(activeCategoriesIds);
            setSelectedCategories((prev) => prev.filter((id) => !idsToRemove.has(id)));
        }
    };

    const handleSelectInactiveCategory = (categoryId: string, checked: boolean) => {
        if (checked) {
            setSelectedInactiveCategories((prev) => [...prev, categoryId]);
        } else {
            setSelectedInactiveCategories((prev) => prev.filter((id) => id !== categoryId));
        }
    };

    const handleSelectAllInactive = (checked: boolean, inactiveCategoriesIds: string[]) => {
        if (checked) {
            setSelectedInactiveCategories((prev) => {
                const newIds = inactiveCategoriesIds.filter((id) => !prev.includes(id));
                return [...prev, ...newIds];
            });
        } else {
            const idsToRemove = new Set(inactiveCategoriesIds);
            setSelectedInactiveCategories((prev) => prev.filter((id) => !idsToRemove.has(id)));
        }
    };

    const clearSelection = () => {
        setSelectedCategories([]);
        setSelectedInactiveCategories([]);
    };

    const getDeactivatableCategories = () => {
        return selectedCategories.filter((id) => !isCategoryInActiveAuction(id, auctions, products, collections));
    };

    const handleBulkDeactivateClick = () => {
        const deactivatable = getDeactivatableCategories();
        if (deactivatable.length === 0) {
            toast({
                title: language === "en" ? "Cannot Deactivate" : "Nije moguće deaktivirati",
                description:
                    language === "en"
                        ? "All selected categories are used in active auctions."
                        : "Sve selektovane kategorije se koriste u aktivnim aukcijama.",
                variant: "destructive",
            });
            return;
        }
        openBulkDialog("bulkDeactivate");
    };

    const confirmBulkDeactivate = async () => {
        const deactivatable = getDeactivatableCategories();

        setIsSubmitting(true);
        try {
            const activeIds = deactivatable.filter((id) => {
                const category = categories.find((c) => c.id === id);
                return category && category.isActive;
            });
            await Promise.all(activeIds.map((id) => CategoryService.update(id, { isActive: false })));
            const deactivatedCount = activeIds.length;
            const skippedCount = selectedCategories.length - deactivatedCount;

            toast({
                title: language === "en" ? "Categories Deactivated" : "Kategorije Deaktivirane",
                description:
                    language === "en"
                        ? `${deactivatedCount} categories deactivated${skippedCount > 0 ? `, ${skippedCount} skipped (in active auctions)` : ""}.`
                        : `${deactivatedCount} kategorija deaktivirano${skippedCount > 0 ? `, ${skippedCount} preskočeno (u aktivnim aukcijama)` : ""}.`,
            });
            setSelectedCategories([]);
            closeBulkDialog();
        } catch (error) {
            console.error("Error bulk deactivating categories:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to deactivate categories." : "Greška pri deaktivaciji kategorija.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBulkActivateClick = () => {
        if (selectedInactiveCategories.length === 0) return;
        openBulkDialog("bulkActivate");
    };

    const confirmBulkActivate = async () => {
        setIsSubmitting(true);
        try {
            const inactiveIds = selectedInactiveCategories.filter((id) => {
                const category = categories.find((c) => c.id === id);
                return category && !category.isActive;
            });
            await Promise.all(inactiveIds.map((id) => CategoryService.update(id, { isActive: true })));
            const activatedCount = inactiveIds.length;

            toast({
                title: language === "en" ? "Categories Activated" : "Kategorije Aktivirane",
                description:
                    language === "en" ? `${activatedCount} categories activated.` : `${activatedCount} kategorija aktivirano.`,
            });
            setSelectedInactiveCategories([]);
            closeBulkDialog();
        } catch (error) {
            console.error("Error bulk activating categories:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to activate categories." : "Greška pri aktivaciji kategorija.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getDeletableCategories = () => {
        const allSelected = [...selectedCategories, ...selectedInactiveCategories];
        return allSelected.filter((id) => !isCategoryInActiveAuction(id, auctions, products, collections));
    };

    const handleBulkDeleteClick = () => {
        const deletable = getDeletableCategories();
        if (deletable.length === 0) {
            toast({
                title: language === "en" ? "Cannot Delete" : "Nije moguće obrisati",
                description:
                    language === "en"
                        ? "All selected categories are used in active auctions and cannot be deleted."
                        : "Sve selektovane kategorije se koriste u aktivnim aukcijama i ne mogu biti obrisane.",
                variant: "destructive",
            });
            return;
        }
        openBulkDialog("bulkDelete");
    };

    const confirmBulkDelete = async () => {
        const deletable = getDeletableCategories();

        setIsSubmitting(true);
        try {
            await Promise.all(deletable.map((id) => CategoryService.delete(id)));
            const deletedCount = deletable.length;
            const allSelected = [...selectedCategories, ...selectedInactiveCategories];
            const skippedCount = allSelected.length - deletedCount;

            toast({
                title: language === "en" ? "Categories Deleted" : "Kategorije Obrisane",
                description:
                    language === "en"
                        ? `${deletedCount} categories deleted${skippedCount > 0 ? `, ${skippedCount} skipped (in active auctions)` : ""}.`
                        : `${deletedCount} kategorija obrisano${skippedCount > 0 ? `, ${skippedCount} preskočeno (u aktivnim aukcijama)` : ""}.`,
            });

            setSelectedCategories([]);
            setSelectedInactiveCategories([]);
            closeBulkDialog();
        } catch (error) {
            console.error("Error bulk deleting categories:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to delete categories." : "Greška pri brisanju kategorija.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const { bulkActions, showBar, totalSelected } = useMemo(() => {
        const totalSelected = selectedCategories.length + selectedInactiveCategories.length;

        const bulkActions = [
            {
                icon: Power,
                label: language === "en" ? "Activate" : "Aktiviraj",
                action: handleBulkActivateClick,
                count: selectedInactiveCategories.length,
                visible: selectedInactiveCategories.length > 0,
                className: "hover:bg-transparent hover:text-foreground",
            },
            {
                icon: PowerOff,
                label: language === "en" ? "Deactivate" : "Deaktiviraj",
                action: handleBulkDeactivateClick,
                count: selectedCategories.length,
                visible: selectedCategories.length > 0,
                className: "hover:bg-transparent hover:text-foreground",
            },
            {
                icon: Trash2,
                label: language === "en" ? "Delete" : "Obriši",
                action: handleBulkDeleteClick,
                count: totalSelected,
                visible: totalSelected > 0,
                className: "text-destructive hover:text-destructive hover:bg-transparent",
            },
        ];

        return {
            bulkActions,
            showBar: totalSelected > 0,
            totalSelected,
        };
    }, [selectedCategories.length, selectedInactiveCategories.length, language]);

    return {
        isSubmitting,
        showBar,
        totalSelected,
        bulkActions,
        selectedCategories,
        setSelectedCategories,
        selectedInactiveCategories,
        setSelectedInactiveCategories,
        clearSelection,
        activeBulkDialog,
        openBulkDialog,
        closeBulkDialog,
        handleSelectCategory,
        handleSelectAll,
        handleSelectInactiveCategory,
        handleSelectAllInactive,
        getDeactivatableCategories,
        handleBulkDeactivateClick,
        confirmBulkDeactivate,
        handleBulkActivateClick,
        confirmBulkActivate,
        getDeletableCategories,
        handleBulkDeleteClick,
        confirmBulkDelete
    };
};

import { useState } from "react";
import { Category, useData, Subcategory } from "@/contexts/DataContext";
import { CategoryService } from "@/services/categoryService";
import { useToast } from "@/hooks/use-toast";
import { isCategoryInActiveAuction, isSubcategoryInActiveAuction } from "../utils/categoryUtils";
import { CategoryDialogKey, CategoryToggleDialog, SubcategoryToggleDialog } from "../config/categoryDialogTypes";

export const useCategoryActions = (language: "en" | "sr", categories: Category[], onSuccess?: () => void) => {
    const { auctions, products, collections } = useData();
    const { toast } = useToast();

    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [activeDialog, setActiveDialog] = useState<CategoryDialogKey | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [isMutating, setIsMutating] = useState(false);

    const [subcategoryToMove, setSubcategoryToMove] = useState<{ sub: Subcategory; fromCategoryId: string } | null>(null);
    const [targetCategoryId, setTargetCategoryId] = useState<string>("");

    const [categoryToggle, setCategoryToggle] = useState<CategoryToggleDialog | null>(null);
    const [subcategoryToggle, setSubcategoryToggle] = useState<SubcategoryToggleDialog | null>(null);

    const openDialog = (type: CategoryDialogKey) => setActiveDialog(type);
    const closeDialog = () => {
        setActiveDialog(null);
        setCategoryToDelete(null);
        setCategoryToggle(null);
        setSubcategoryToggle(null);
    };

    const toggleCategoryExpanded = (id: string) => {
        setExpandedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    };

    const handleDeleteClick = (id: string) => {
        if (isCategoryInActiveAuction(id, auctions, products, collections)) {
            toast({
                title: language === "en" ? "Cannot Delete" : "Nije moguće obrisati",
                description:
                    language === "en"
                        ? "This category is used in an active auction and cannot be deleted."
                        : "Ova kategorija se koristi u aktivnoj aukciji i ne može biti obrisana.",
                variant: "destructive",
            });
            return;
        }
        setCategoryToDelete(id);
        openDialog("delete");
    };

    const handleDeleteConfirm = async () => {
        if (categoryToDelete) {
            setIsMutating(true);
            try {
                await CategoryService.delete(categoryToDelete);
                toast({
                    title: language === "en" ? "Category Deleted" : "Kategorija Obrisana",
                    description: language === "en" ? "The category has been deleted." : "Kategorija je obrisana.",
                });
                onSuccess?.();
            } catch (error) {
                console.error("Error deleting category:", error);
                toast({
                    title: language === "en" ? "Error" : "Greška",
                    description: language === "en" ? "Failed to delete category." : "Greška pri brisanju kategorije.",
                    variant: "destructive",
                });
            } finally {
                setIsMutating(false);
            }
        }
        closeDialog();
    };

    const handleToggleCategoryActive = (category: Category) => {
        if (category.isActive && isCategoryInActiveAuction(category.id, auctions, products, collections)) {
            toast({
                title: language === "en" ? "Cannot Deactivate" : "Nije moguće deaktivirati",
                description:
                    language === "en"
                        ? "This category is used in an active auction and cannot be deactivated."
                        : "Ova kategorija se koristi u aktivnoj aukciji i ne može biti deaktivirana.",
                variant: "destructive",
            });
            return;
        }
        setCategoryToggle({
            category,
            action: category.isActive ? "deactivate" : "activate",
        });
        openDialog("categoryToggle");
    };

    const confirmCategoryToggle = async () => {
        if (!categoryToggle) return;
        const { category, action } = categoryToggle;
        setIsMutating(true);
        try {
            await CategoryService.update(category.id, { isActive: action === "activate" });
            toast({
                title:
                    action === "deactivate"
                        ? language === "en"
                            ? "Category Deactivated"
                            : "Kategorija Deaktivirana"
                        : language === "en"
                            ? "Category Activated"
                            : "Kategorija Aktivirana",
                description:
                    action === "deactivate"
                        ? language === "en"
                            ? "The category has been deactivated."
                            : "Kategorija je deaktivirana."
                        : language === "en"
                            ? "The category has been activated."
                            : "Kategorija je aktivirana.",
            });
            onSuccess?.();
        } catch (error) {
            console.error("Error toggling category:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update category status." : "Greška pri promeni statusa kategorije.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
        closeDialog();
    };

    const handleToggleSubcategoryActive = (category: Category, subIndex: number) => {
        const sub = category.subcategories[subIndex];
        if (sub.isActive && isSubcategoryInActiveAuction(category.id, sub.id, auctions, products, collections)) {
            toast({
                title: language === "en" ? "Cannot Deactivate" : "Nije moguće deaktivirati",
                description:
                    language === "en"
                        ? "This subcategory is used in an active auction and cannot be deactivated."
                        : "Ova podkategorija se koristi u aktivnoj aukciji i ne može biti deaktivirana.",
                variant: "destructive",
            });
            return;
        }
        setSubcategoryToggle({
            category,
            subIndex,
            action: sub.isActive ? "deactivate" : "activate",
        });
        openDialog("subcategoryToggle");
    };

    const confirmSubcategoryToggle = async () => {
        if (!subcategoryToggle) return;
        const { category, subIndex, action } = subcategoryToggle;
        const updatedSubcategories = category.subcategories.map((s, i) =>
            i === subIndex ? { ...s, isActive: action === "activate" } : s,
        );
        setIsMutating(true);
        try {
            await CategoryService.update(category.id, { subcategories: updatedSubcategories });
            toast({
                title:
                    action === "deactivate"
                        ? language === "en"
                            ? "Subcategory Deactivated"
                            : "Podkategorija Deaktivirana"
                        : language === "en"
                            ? "Subcategory Activated"
                            : "Podkategorija Aktivirana",
            });
            onSuccess?.();
        } catch (error) {
            console.error("Error toggling subcategory:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update subcategory status." : "Greška pri promeni statusa podkategorije.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
        closeDialog();
    };

    const handleMoveSubcategory = (sub: Subcategory, fromCategoryId: string) => {
        if (isSubcategoryInActiveAuction(fromCategoryId, sub.id, auctions, products, collections)) {
            toast({
                title: language === "en" ? "Cannot Move" : "Nije moguće premestiti",
                description:
                    language === "en"
                        ? "This subcategory is used in an active auction and cannot be moved."
                        : "Ova podkategorija se koristi u aktivnoj aukciji i ne može biti premeštena.",
                variant: "destructive",
            });
            return;
        }
        setSubcategoryToMove({ sub, fromCategoryId });
        setTargetCategoryId("");
        openDialog("moveSubcategory");
    };

    const confirmMoveSubcategory = async () => {
        if (!subcategoryToMove || !targetCategoryId) return;

        const { sub, fromCategoryId } = subcategoryToMove;
        const fromCategory = categories.find((c) => c.id === fromCategoryId);
        const toCategory = categories.find((c) => c.id === targetCategoryId);

        if (!fromCategory || !toCategory) return;

        if (isCategoryInActiveAuction(targetCategoryId, auctions, products, collections)) {
            toast({
                title: language === "en" ? "Cannot Move" : "Nije moguće premestiti",
                description:
                    language === "en"
                        ? `The target category "${toCategory.title.en}" is used in an active auction and cannot receive subcategories.`
                        : `Kategorija "${toCategory.title.sr}" u koju pokušavate da premestite podkategoriju je na aktivnoj aukciji.`,
                variant: "destructive",
            });
            return;
        }

        setIsMutating(true);
        try {
            await CategoryService.moveSubcategory(sub, fromCategoryId, targetCategoryId);

            toast({
                title: language === "en" ? "Subcategory Moved" : "Podkategorija Premeštena",
                description:
                    language === "en"
                        ? `Moved to ${toCategory.title.en} and associated items updated.`
                        : `Premešteno u ${toCategory.title.sr} i povezani predmeti su ažurirani.`,
            });
            onSuccess?.();
        } catch (error) {
            console.error("Error moving subcategory:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to move subcategory." : "Greška pri premeštanju podkategorije.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }

        closeDialog();
        setSubcategoryToMove(null);
    };

    return {
        expandedCategories,
        toggleCategoryExpanded,
        activeDialog,
        openDialog,
        closeDialog,
        handleDeleteClick,
        handleDeleteConfirm,
        categoryToggle,
        handleToggleCategoryActive,
        confirmCategoryToggle,
        subcategoryToggle,
        handleToggleSubcategoryActive,
        confirmSubcategoryToggle,
        subcategoryToMove,
        targetCategoryId,
        setTargetCategoryId,
        handleMoveSubcategory,
        confirmMoveSubcategory,
        isMutating
    };
};

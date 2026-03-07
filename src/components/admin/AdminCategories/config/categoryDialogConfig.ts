import { useCategoryActions } from "../hooks/useCategoryActions";
import { useCategoryBulkActions } from "../hooks/useCategoryBulkActions";
import {
    CategoryDialogKey,
    CategoryStaticDialogKey,
    CategoryDynamicDialogKey,
    CategoryDialogConfig,
} from "./categoryDialogTypes";
import { CATEGORY_DIALOG_I18N } from "./categoryDialogI18n";
import { Power, PowerOff, Trash2, CheckSquare } from "lucide-react";

type CategoryActions = ReturnType<typeof useCategoryActions>;
type CategoryBulkActions = ReturnType<typeof useCategoryBulkActions>;

const getActionHandlers = (
    actions: CategoryActions,
    bulkActions: CategoryBulkActions
): Record<CategoryStaticDialogKey, () => void> => ({
    delete: actions.handleDeleteConfirm,
    bulkDeactivate: bulkActions.confirmBulkDeactivate,
    bulkActivate: bulkActions.confirmBulkActivate,
    bulkDelete: bulkActions.confirmBulkDelete,
});

const getDynamicDialogConfigs = (
    language: "en" | "sr",
    actions: CategoryActions,
    bulkActions: CategoryBulkActions
): Partial<Record<CategoryDialogKey, CategoryDialogConfig>> => {
    const {
        categoryToggle,
        confirmCategoryToggle,
        subcategoryToggle,
        confirmSubcategoryToggle,
    } = actions;

    const {
        getDeactivatableCategories,
        getDeletableCategories,
        selectedCategories,
        selectedInactiveCategories,
    } = bulkActions;

    const configs: Partial<Record<CategoryDialogKey, CategoryDialogConfig>> = {
        categoryToggle: {
            title: categoryToggle?.action === "deactivate"
                ? (language === "en" ? "Deactivate Category" : "Deaktiviraj Kategoriju")
                : (language === "en" ? "Activate Category" : "Aktiviraj Kategoriju"),
            description: categoryToggle?.action === "deactivate"
                ? (language === "en"
                    ? `Are you sure you want to deactivate "${categoryToggle?.category.description.en.split(",")[0]}"?`
                    : `Da li ste sigurni da želite da deaktivirate "${categoryToggle?.category.description.sr.split(",")[0]}"?`)
                : (language === "en"
                    ? `Are you sure you want to activate "${categoryToggle?.category.description.en.split(",")[0]}"?`
                    : `Da li ste sigurni da želite da aktivirate "${categoryToggle?.category.description.sr.split(",")[0]}"?`),
            actionText: categoryToggle?.action === "deactivate"
                ? (language === "en" ? "Deactivate" : "Deaktiviraj")
                : (language === "en" ? "Activate" : "Aktiviraj"),
            icon: categoryToggle?.action === "deactivate" ? PowerOff : Power,
            onAction: confirmCategoryToggle,
        },
        subcategoryToggle: {
            title: subcategoryToggle?.action === "deactivate"
                ? (language === "en" ? "Deactivate Subcategory" : "Deaktiviraj Podkategoriju")
                : (language === "en" ? "Activate Subcategory" : "Aktiviraj Podkategoriju"),
            description: (() => {
                const sub = subcategoryToggle?.category.subcategories[subcategoryToggle?.subIndex ?? 0];
                return subcategoryToggle?.action === "deactivate"
                    ? (language === "en"
                        ? `Are you sure you want to deactivate "${sub?.description.en}"?`
                        : `Da li ste sigurni da želite da deaktivirate "${sub?.description.sr}"?`)
                    : (language === "en"
                        ? `Are you sure you want to activate "${sub?.description.en}"?`
                        : `Da li ste sigurni da želite da aktivirate "${sub?.description.sr}"?`);
            })(),
            actionText: subcategoryToggle?.action === "deactivate"
                ? (language === "en" ? "Deactivate" : "Deaktiviraj")
                : (language === "en" ? "Activate" : "Aktiviraj"),
            icon: subcategoryToggle?.action === "deactivate" ? PowerOff : Power,
            onAction: confirmSubcategoryToggle,
        },
        bulkDeactivate: {
            title: language === "en" ? "Bulk Deactivate Categories" : "Masovna Deaktivacija Kategorija",
            description: language === "en"
                ? `You are about to deactivate ${getDeactivatableCategories().length} categories. ${selectedCategories.length - getDeactivatableCategories().length > 0
                    ? `${selectedCategories.length - getDeactivatableCategories().length} categories will be skipped because they are used in active auctions.`
                    : ""}`
                : `Deaktiviraćete ${getDeactivatableCategories().length} kategorija. ${selectedCategories.length - getDeactivatableCategories().length > 0
                    ? `${selectedCategories.length - getDeactivatableCategories().length} kategorija će biti preskočeno jer se koriste u aktivnim aukcijama.`
                    : ""}`,
            actionText: language === "en" ? "Deactivate" : "Deaktiviraj",
            onAction: bulkActions.confirmBulkDeactivate,
            icon: CheckSquare,
        },
        bulkDelete: {
            title: language === "en" ? "Delete Selected Categories?" : "Obrisati Izabrane Kategorije?",
            description: language === "en"
                ? `You are about to permanently delete ${getDeletableCategories().length} categories and all their subcategories. ${selectedCategories.length + selectedInactiveCategories.length - getDeletableCategories().length > 0
                    ? `${selectedCategories.length + selectedInactiveCategories.length - getDeletableCategories().length} categories will be skipped because they are used in active auctions.`
                    : ""} This action cannot be undone.`
                : `Trajno ćete obrisati ${getDeletableCategories().length} kategorija i sve njihove podkategorije. ${selectedCategories.length + selectedInactiveCategories.length - getDeletableCategories().length > 0
                    ? `${selectedCategories.length + selectedInactiveCategories.length - getDeletableCategories().length} kategorija će biti preskočeno jer se koriste u aktivnim aukcijama.`
                    : ""} Ova akcija se ne može poništiti.`,
            actionText: language === "en" ? "Delete" : "Obriši",
            onAction: bulkActions.confirmBulkDelete,
            actionClassName: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            icon: Trash2,
        },
        bulkActivate: {
            title: language === "en" ? "Bulk Activate Categories" : "Masovna Aktivacija Kategorija",
            description: language === "en"
                ? `You are about to activate ${selectedInactiveCategories.length} categories.`
                : `Aktiviraćete ${selectedInactiveCategories.length} kategorija.`,
            actionText: language === "en" ? "Activate" : "Aktiviraj",
            onAction: bulkActions.confirmBulkActivate,
            icon: CheckSquare,
        }
    };

    return configs;
};

export const buildCategoryDialogConfig = (
    language: "en" | "sr",
    actions: CategoryActions,
    bulkActions: CategoryBulkActions
): Partial<Record<CategoryDialogKey, CategoryDialogConfig>> => {
    const handlers = getActionHandlers(actions, bulkActions);
    const dynamicConfigs = getDynamicDialogConfigs(language, actions, bulkActions);

    const staticConfigs = (Object.keys(CATEGORY_DIALOG_I18N) as CategoryStaticDialogKey[]).reduce((acc, key) => {
        const i18n = CATEGORY_DIALOG_I18N[key][language];
        acc[key] = {
            ...i18n,
            onAction: handlers[key],
        } as CategoryDialogConfig;
        return acc;
    }, {} as Record<CategoryStaticDialogKey, CategoryDialogConfig>);

    return {
        ...staticConfigs,
        ...dynamicConfigs,
    };
};

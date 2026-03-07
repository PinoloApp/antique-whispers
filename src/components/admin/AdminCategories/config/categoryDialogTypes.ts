import { Category, Subcategory } from "@/contexts/DataContext";

export type CategoryStaticDialogKey =
    | "delete"
    | "bulkDeactivate"
    | "bulkActivate"
    | "bulkDelete";

export type CategoryDynamicDialogKey =
    | "categoryToggle"
    | "subcategoryToggle";

export type CategoryDialogKey = CategoryStaticDialogKey | CategoryDynamicDialogKey | "moveSubcategory";

export interface CategoryDialogConfig {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
    onAction: () => void;
    icon?: any;
}

export interface CategoryI18nContent {
    title: string;
    description: string;
    actionText: string;
    cancelText?: string;
    actionClassName?: string;
}

export type CategoryDialogI18n = Record<CategoryStaticDialogKey, { en: CategoryI18nContent; sr: CategoryI18nContent }>;

export interface CategoryToggleDialog {
    category: Category;
    action: "activate" | "deactivate";
}

export interface SubcategoryToggleDialog {
    category: Category;
    subIndex: number;
    action: "activate" | "deactivate";
}

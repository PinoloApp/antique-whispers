import { Category, Subcategory } from "@/contexts/DataContext";

export interface SubcategoryFormData {
    id: string;
    key: string;
    titleEn: string;
    titleSr: string;
    descriptionEn: string;
    descriptionSr: string;
    isActive: boolean;
}

export interface CategoryFormData {
    id: string;
    key: string;
    titleEn: string;
    titleSr: string;
    descriptionEn: string;
    descriptionSr: string;
    isActive: boolean;
    subcategories: SubcategoryFormData[];
}

export type SortOption =
    | "name-asc"
    | "name-desc"
    | "item-asc"
    | "item-desc"
    | "newest"
    | "oldest";

export type StatusFilter = "all" | "active" | "inactive";

export interface CategoryToggleDialog {
    category: Category;
    action: "activate" | "deactivate";
}

export interface SubcategoryToggleDialog {
    category: Category;
    subIndex: number;
    action: "activate" | "deactivate";
}

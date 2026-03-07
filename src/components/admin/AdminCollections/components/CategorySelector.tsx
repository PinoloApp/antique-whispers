import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category } from "@/contexts/DataContext";

interface CategorySelectorProps {
    language: "en" | "sr";
    categories: Category[];
    selectedCategory: string;
    selectedSubcategory: string;
    onChangeCategory: (val: string) => void;
    onChangeSubcategory: (val: string) => void;
}

export const CategorySelector = React.memo((props: CategorySelectorProps) => {
    const { language, categories, selectedCategory, selectedSubcategory, onChangeCategory, onChangeSubcategory } = props;
    const { t } = useLanguage();

    const activeCategories = React.useMemo(() => categories.filter((c) => c.isActive), [categories]);
    const selectedCatObj = React.useMemo(() => categories.find((c) => c.id === selectedCategory), [categories, selectedCategory]);
    const activeSubs = React.useMemo(() => selectedCatObj?.subcategories.filter((s) => s.isActive) || [], [selectedCatObj]);

    return (
        <>
            <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium">{t("collectionCategory")}</label>
                <Select value={selectedCategory} onValueChange={onChangeCategory}>
                    <SelectTrigger className="h-9 sm:h-10 text-sm">
                        <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                    <SelectContent>
                        {activeCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.title[language]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {selectedCategory && activeSubs.length > 0 && (
                <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium">{t("collectionSubcategory")}</label>
                    <Select value={selectedSubcategory} onValueChange={onChangeSubcategory}>
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                            <SelectValue placeholder={t("selectSubcategory")} />
                        </SelectTrigger>
                        <SelectContent>
                            {activeSubs.map((sub) => (
                                <SelectItem key={sub.id} value={sub.id}>{sub.title[language]}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </>
    );
});
CategorySelector.displayName = "CategorySelector";

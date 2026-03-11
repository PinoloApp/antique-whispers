import { useState } from "react";
import { Category, useData, Subcategory } from "@/contexts/DataContext";
import { CategoryService } from "@/services/categoryService";
import { ProductService } from "@/services/productService";
import { CollectionService } from "@/services/collectionService";
import { CollectionProductService } from "@/services/collectionProductService";
import { useToast } from "@/hooks/use-toast";
import { CategoryFormData } from "../types";
import { slugify, isSubcategoryInActiveAuction, isCategoryInActiveAuction } from "../utils/categoryUtils";

export const useCategoryForm = (language: "en" | "sr", categories: Category[]) => {
    const { auctions, products, collections } = useData();
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [formData, setFormData] = useState<CategoryFormData>({
        id: "",
        key: "",
        titleEn: "",
        titleSr: "",
        descriptionEn: "",
        descriptionSr: "",
        isActive: true,
        subcategories: [],
    });

    const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

    const markFormTouched = (field: string) => setFormTouched((prev) => ({ ...prev, [field]: true }));

    const resetForm = () => {
        setFormData({
            id: "",
            key: "",
            titleEn: "",
            titleSr: "",
            descriptionEn: "",
            descriptionSr: "",
            isActive: true,
            subcategories: [],
        });
        setEditingCategory(null);
        setFormTouched({});
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            id: category.id,
            key: category.key,
            titleEn: category.title.en,
            titleSr: category.title.sr,
            descriptionEn: category.description.en,
            descriptionSr: category.description.sr,
            isActive: category.isActive,
            subcategories: category.subcategories.map((sub) => ({
                id: sub.id,
                key: sub.key,
                titleEn: sub.title.en,
                titleSr: sub.title.sr,
                descriptionEn: sub.description.en,
                descriptionSr: sub.description.sr,
                isActive: sub.isActive,
            })),
        });
        setIsOpen(true);
    };

    const addSubcategory = () => {
        setFormData((prev) => ({
            ...prev,
            subcategories: [
                ...prev.subcategories,
                { id: "", key: "", titleEn: "", titleSr: "", descriptionEn: "", descriptionSr: "", isActive: true },
            ],
        }));
        setTimeout(() => {
            const formEl = document.querySelector('[data-category-form]');
            if (formEl) formEl.scrollTop = formEl.scrollHeight;
        }, 50);
    };

    const removeSubcategory = (index: number) => {
        const subToRemove = formData.subcategories[index];
        if (subToRemove.id && isSubcategoryInActiveAuction(formData.id, subToRemove.id, auctions, products, collections)) {
            toast({
                title: language === "en" ? "Cannot Remove" : "Nije moguće ukloniti",
                description:
                    language === "en"
                        ? "This subcategory is used in an active auction and cannot be removed."
                        : "Ova podkategorija se koristi u aktivnoj aukciji i ne može biti uklonjena.",
                variant: "destructive",
            });
            return;
        }
        setFormData((prev) => ({
            ...prev,
            subcategories: prev.subcategories.filter((_, i) => i !== index),
        }));
    };

    const updateSubcategory = (index: number, field: string, value: string | boolean) => {
        setFormData((prev) => {
            const updated = [...prev.subcategories];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, subcategories: updated };
        });
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            e.preventDefault();

            setFormTouched({
                titleSr: true, titleEn: true, descriptionSr: true, descriptionEn: true,
            });

            const requiredFields = [
                { value: formData.titleSr, label: 'titleSr' },
                { value: formData.titleEn, label: 'titleEn' },
                { value: formData.descriptionSr, label: 'descriptionSr' },
                { value: formData.descriptionEn, label: 'descriptionEn' },
            ];
            if (requiredFields.some(f => !f.value.trim())) {
                toast({
                    title: language === "en" ? "Validation Error" : "Greška Validacije",
                    description: language === "en" ? "All fields are required." : "Sva polja su obavezna.",
                    variant: "destructive",
                });
                return;
            }

            for (let i = 0; i < formData.subcategories.length; i++) {
                const sub = formData.subcategories[i];
                setFormTouched(prev => ({
                    ...prev,
                    [`sub_${i}_titleSr`]: true, [`sub_${i}_titleEn`]: true,
                    [`sub_${i}_descriptionSr`]: true, [`sub_${i}_descriptionEn`]: true,
                }));
                if (!sub.titleSr.trim() || !sub.titleEn.trim() || !sub.descriptionSr.trim() || !sub.descriptionEn.trim()) {
                    toast({
                        title: language === "en" ? "Validation Error" : "Greška Validacije",
                        description: language === "en"
                            ? `All fields are required for subcategory ${i + 1}.`
                            : `Sva polja su obavezna za podkategoriju ${i + 1}.`,
                        variant: "destructive",
                    });
                    return;
                }
            }

            // Check for duplicate titles within the same category
            const subTitlesEn = formData.subcategories.map(s => s.titleEn.trim().toLowerCase());
            const subTitlesSr = formData.subcategories.map(s => s.titleSr.trim().toLowerCase());

            const hasDuplicateEn = subTitlesEn.some((title, index) => subTitlesEn.indexOf(title) !== index);
            const hasDuplicateSr = subTitlesSr.some((title, index) => subTitlesSr.indexOf(title) !== index);

            if (hasDuplicateEn || hasDuplicateSr) {
                toast({
                    title: language === "en" ? "Duplicate Subcategory" : "Duplikat Podkategorije",
                    description: language === "en"
                        ? "Subcategory titles must be unique within the same category."
                        : "Naslovi podkategorija moraju biti jedinstveni unutar iste kategorije.",
                    variant: "destructive",
                });
                return;
            }

            const categoryId = editingCategory ? formData.id : slugify(formData.titleEn);
            const categoryKey = editingCategory ? formData.key : `category.${slugify(formData.titleEn)}`;

            if (!editingCategory) {
                const duplicateCategory = categories.find((cat) => cat.id.toLowerCase() === categoryId.toLowerCase());
                if (duplicateCategory) {
                    toast({
                        title: language === "en" ? "Duplicate Category" : "Duplikat Kategorije",
                        description:
                            language === "en"
                                ? `A category with this title already exists.`
                                : `Kategorija sa ovim naslovom već postoji.`,
                        variant: "destructive",
                    });
                    return;
                }
            }

            const builtSubcategories: Subcategory[] = formData.subcategories.map((sub, idx) => {
                // If it's an existing subcategory (has an ID), keep it. 
                // If it's new (no ID), generate a truly unique one with a timestamp suffix.
                const timestamp = Date.now().toString().slice(-4);
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                const uniqueSuffix = `${timestamp}${random}`;

                const subId = sub.id ? sub.id : `${categoryId}-${slugify(sub.titleEn) || 'sub'}-${uniqueSuffix}`;
                const subKey = sub.key ? sub.key : `subcategory.${slugify(sub.titleEn) || 'sub'}-${uniqueSuffix}`;

                return {
                    id: subId,
                    key: subKey,
                    parentCategoryId: categoryId,
                    title: { en: sub.titleEn, sr: sub.titleSr },
                    description: { en: sub.descriptionEn, sr: sub.descriptionSr },
                    isActive: sub.isActive,
                };
            });

            const subcategoryIds = builtSubcategories.map((sub) => sub.id.toLowerCase());
            const duplicateSubIds = subcategoryIds.filter((id, index) => subcategoryIds.indexOf(id) !== index);
            if (duplicateSubIds.length > 0) {
                toast({
                    title: language === "en" ? "Duplicate Subcategory" : "Duplikat Podkategorije",
                    description:
                        language === "en"
                            ? `Subcategory titles must be unique.`
                            : `Naslovi podkategorija moraju biti jedinstveni.`,
                    variant: "destructive",
                });
                return;
            }

            const categoriesToCheck = editingCategory
                ? categories.filter(c => c.id !== editingCategory.id)
                : categories;
            for (const sub of builtSubcategories) {
                for (const existingCat of categoriesToCheck) {
                    const duplicateSub = existingCat.subcategories.find(
                        (existingSub) => existingSub.id.toLowerCase() === sub.id.toLowerCase(),
                    );
                    if (duplicateSub) {
                        toast({
                            title: language === "en" ? "Duplicate Subcategory" : "Duplikat Podkategorije",
                            description:
                                language === "en"
                                    ? `Subcategory "${sub.title.en}" already exists in category "${existingCat.title.en}".`
                                    : `Podkategorija "${sub.title.sr}" već postoji u kategoriji "${existingCat.title.sr}".`,
                            variant: "destructive",
                        });
                        return;
                    }
                }
            }

            if (editingCategory && !formData.isActive && editingCategory.isActive) {
                if (isCategoryInActiveAuction(editingCategory.id, auctions, products, collections)) {
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
            }

            if (editingCategory) {
                for (const sub of formData.subcategories) {
                    const originalSub = editingCategory.subcategories.find((s) => s.id === sub.id);
                    if (originalSub && originalSub.isActive && !sub.isActive) {
                        if (isSubcategoryInActiveAuction(editingCategory.id, sub.id, auctions, products, collections)) {
                            toast({
                                title: language === "en" ? "Cannot Deactivate Subcategory" : "Nije moguće deaktivirati podkategoriju",
                                description:
                                    language === "en"
                                        ? `Subcategory "${sub.titleEn}" is used in an active auction.`
                                        : `Podkategorija "${sub.titleSr}" se koristi u aktivnoj aukciji.`,
                                variant: "destructive",
                            });
                            return;
                        }
                    }
                }
            }

            const categoryData: Category = {
                id: categoryId,
                key: categoryKey,
                title: { en: formData.titleEn, sr: formData.titleSr },
                description: { en: formData.descriptionEn, sr: formData.descriptionSr },
                isActive: formData.isActive,
                attributes: editingCategory ? editingCategory.attributes : [],
                subcategories: builtSubcategories,
                createdAt: editingCategory ? editingCategory.createdAt : new Date(),
            };

            if (editingCategory) {
                // Identify removed subcategories
                const currentSubIds = builtSubcategories.map(s => s.id);
                const removedSubcategories = editingCategory.subcategories.filter(s => !currentSubIds.includes(s.id));

                // Clear associations for removed subcategories
                if (removedSubcategories.length > 0) {
                    await Promise.all(removedSubcategories.flatMap(sub => [
                        ProductService.clearSubcategoryAssociations(editingCategory.id, sub.id),
                        CollectionService.clearSubcategoryAssociations(editingCategory.id, sub.id),
                        CollectionProductService.clearSubcategoryAssociations(editingCategory.id, sub.id),
                    ]));
                }

                await CategoryService.update(editingCategory.id, categoryData);
                toast({
                    title: language === "en" ? "Category Updated" : "Kategorija Ažurirana",
                    description:
                        language === "en" ? "The category has been updated successfully." : "Kategorija je uspešno ažurirana.",
                });
            } else {
                await CategoryService.create(categoryData);
                toast({
                    title: language === "en" ? "Category Created" : "Kategorija Kreirana",
                    description:
                        language === "en" ? "The category has been created successfully." : "Kategorija je uspešno kreirana.",
                });
            }

            setIsOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving category:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to save category. Please try again." : "Greška pri čuvanju kategorije. Pokušajte ponovo.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        isSubmitting,
        isOpen,
        setIsOpen,
        formData,
        setFormData,
        formTouched,
        markFormTouched,
        editingCategory,
        handleEdit,
        resetForm,
        addSubcategory,
        removeSubcategory,
        updateSubcategory,
        handleSubmit
    };
};

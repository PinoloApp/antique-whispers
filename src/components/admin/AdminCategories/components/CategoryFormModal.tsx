import React from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getFieldError, type ValidationRule, validators } from "@/lib/validation";
import { useCategoryForm } from "../hooks/useCategoryForm";

interface CategoryFormModalProps {
    language: "en" | "sr";
    formHook: ReturnType<typeof useCategoryForm>;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ language, formHook }) => {
    const {
        isOpen,
        setIsOpen,
        formData,
        setFormData,
        formTouched,
        markFormTouched,
        editingCategory,
        resetForm,
        addSubcategory,
        removeSubcategory,
        updateSubcategory,
        isSubmitting,
        handleSubmit,
    } = formHook;

    const requiredRule: ValidationRule[] = [
        { validate: validators.required, message: { en: "This field is required", sr: "Ovo polje je obavezno" } },
    ];
    const getErr = (field: string, value: string) =>
        formTouched[field] ? getFieldError(value, requiredRule, language) : null;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && isSubmitting) return;
                setIsOpen(open);
                if (!open) resetForm();
            }}
        >
            <DialogTrigger asChild>
                <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    {language === "en" ? "Add Category" : "Dodaj Kategoriju"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden" aria-describedby={undefined}>
                <div className="flex flex-col h-full max-h-[95vh] overflow-y-auto p-6" data-category-form>
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory
                                ? language === "en"
                                    ? "Edit Category"
                                    : "Izmeni Kategoriju"
                                : language === "en"
                                    ? "Add New Category"
                                    : "Dodaj Novu Kategoriju"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2" noValidate>
                        {/* Fieldset to disable all inputs while submitting */}
                        <fieldset disabled={isSubmitting} className="space-y-4">
                            {/* Title */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">{language === "en" ? "Title (SR)" : "Naslov (SR)"}</label>
                                    <Input
                                        value={formData.titleSr}
                                        onChange={(e) => setFormData({ ...formData, titleSr: e.target.value })}
                                        onBlur={() => markFormTouched("titleSr")}
                                        placeholder={language === "en" ? "Title in Serbian" : "Naslov na srpskom"}
                                        required
                                    />
                                    {getErr("titleSr", formData.titleSr) && (
                                        <p className="text-xs text-destructive mt-1">{getErr("titleSr", formData.titleSr)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">{language === "en" ? "Title (EN)" : "Naslov (EN)"}</label>
                                    <Input
                                        value={formData.titleEn}
                                        onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                        onBlur={() => markFormTouched("titleEn")}
                                        placeholder={language === "en" ? "Title in English" : "Naslov na engleskom"}
                                        required
                                    />
                                    {getErr("titleEn", formData.titleEn) && (
                                        <p className="text-xs text-destructive mt-1">{getErr("titleEn", formData.titleEn)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <label className="text-sm font-medium">
                                    {formData.isActive
                                        ? language === "en"
                                            ? "Active"
                                            : "Aktivna"
                                        : language === "en"
                                            ? "Inactive"
                                            : "Neaktivna"}
                                </label>
                            </div>

                            {/* Description */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">{language === "en" ? "Description (SR)" : "Opis (SR)"}</label>
                                    <Textarea
                                        value={formData.descriptionSr}
                                        onChange={(e) => setFormData({ ...formData, descriptionSr: e.target.value })}
                                        onBlur={() => markFormTouched("descriptionSr")}
                                        required
                                    />
                                    {getErr("descriptionSr", formData.descriptionSr) && (
                                        <p className="text-xs text-destructive mt-1">{getErr("descriptionSr", formData.descriptionSr)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium">{language === "en" ? "Description (EN)" : "Opis (EN)"}</label>
                                    <Textarea
                                        value={formData.descriptionEn}
                                        onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                        onBlur={() => markFormTouched("descriptionEn")}
                                        required
                                    />
                                    {getErr("descriptionEn", formData.descriptionEn) && (
                                        <p className="text-xs text-destructive mt-1">{getErr("descriptionEn", formData.descriptionEn)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-medium text-foreground">
                                        {language === "en" ? "Subcategories" : "Podkategorije"}
                                    </h4>
                                    {formData.subcategories.length === 0 && (
                                        <Button type="button" variant="outline" size="sm" onClick={addSubcategory}>
                                            <Plus className="w-4 h-4 mr-1" />
                                            {language === "en" ? "Add" : "Dodaj"}
                                        </Button>
                                    )}
                                </div>
                                {formData.subcategories.map((sub, index) => (
                                    <div key={index} className="p-4 bg-muted/30 rounded-lg mb-3">
                                        <div className="flex justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium text-muted-foreground">
                                                    {language === "en" ? `Subcategory ${index + 1}` : `Podkategorija ${index + 1}`}
                                                </span>
                                                {!sub.isActive && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {language === "en" ? "Inactive" : "Neaktivna"}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Switch
                                                        checked={sub.isActive}
                                                        onCheckedChange={(checked) => updateSubcategory(index, "isActive", checked)}
                                                    />
                                                </div>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeSubcategory(index)}>
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Subcategory Title */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <Input
                                                    placeholder={language === "en" ? "Title (SR)" : "Naslov (SR)"}
                                                    value={sub.titleSr}
                                                    onChange={(e) => updateSubcategory(index, "titleSr", e.target.value)}
                                                    onBlur={() => markFormTouched(`sub_${index}_titleSr`)}
                                                    required
                                                />
                                                {getErr(`sub_${index}_titleSr`, sub.titleSr) && (
                                                    <p className="text-xs text-destructive mt-1">{getErr(`sub_${index}_titleSr`, sub.titleSr)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Input
                                                    placeholder={language === "en" ? "Title (EN)" : "Naslov (EN)"}
                                                    value={sub.titleEn}
                                                    onChange={(e) => updateSubcategory(index, "titleEn", e.target.value)}
                                                    onBlur={() => markFormTouched(`sub_${index}_titleEn`)}
                                                    required
                                                />
                                                {getErr(`sub_${index}_titleEn`, sub.titleEn) && (
                                                    <p className="text-xs text-destructive mt-1">{getErr(`sub_${index}_titleEn`, sub.titleEn)}</p>
                                                )}
                                            </div>
                                        </div>
                                        {/* Subcategory Description */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div>
                                                <Input
                                                    placeholder={language === "en" ? "Description (SR)" : "Opis (SR)"}
                                                    value={sub.descriptionSr}
                                                    onChange={(e) => updateSubcategory(index, "descriptionSr", e.target.value)}
                                                    onBlur={() => markFormTouched(`sub_${index}_descriptionSr`)}
                                                    required
                                                />
                                                {getErr(`sub_${index}_descriptionSr`, sub.descriptionSr) && (
                                                    <p className="text-xs text-destructive mt-1">{getErr(`sub_${index}_descriptionSr`, sub.descriptionSr)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Input
                                                    placeholder={language === "en" ? "Description (EN)" : "Opis (EN)"}
                                                    value={sub.descriptionEn}
                                                    onChange={(e) => updateSubcategory(index, "descriptionEn", e.target.value)}
                                                    onBlur={() => markFormTouched(`sub_${index}_descriptionEn`)}
                                                    required
                                                />
                                                {getErr(`sub_${index}_descriptionEn`, sub.descriptionEn) && (
                                                    <p className="text-xs text-destructive mt-1">{getErr(`sub_${index}_descriptionEn`, sub.descriptionEn)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {formData.subcategories.length > 0 && (
                                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={addSubcategory}>
                                        <Plus className="w-4 h-4 mr-1" />
                                        {language === "en" ? "Add Subcategory" : "Dodaj Podkategoriju"}
                                    </Button>
                                )}
                            </div>

                        </fieldset>

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {editingCategory
                                ? language === "en"
                                    ? "Update Category"
                                    : "Ažuriraj Kategoriju"
                                : language === "en"
                                    ? "Create Category"
                                    : "Kreiraj Kategoriju"}
                        </Button>
                    </form>
                </div>
                {isSubmitting && (
                    <div className="absolute inset-0 flex justify-center items-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

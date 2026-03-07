import React from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageDropzone from "../../ImageDropzone";
import { Category, LotState } from "@/contexts/DataContext";
import { useProductForm } from "../hooks/useProductForm";
import { ValidationRule, validators, getFieldError } from "@/lib/validation";

interface ProductFormModalProps {
    language: "en" | "sr";
    categories: Category[];
    formHook: ReturnType<typeof useProductForm>;
    lotStateOptions: { value: LotState; labelEn: string; labelSr: string }[];
    onSubmit: (e: React.FormEvent) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
    language,
    categories,
    formHook,
    lotStateOptions,
    onSubmit,
}) => {
    const {
        isSubmitting,
        isOpen,
        setIsOpen,
        editingProduct,
        formData,
        setFormData,
        uploadedImages,
        setUploadedImages,
        formTouched,
        markFormTouched,
        resetForm,
    } = formHook;

    const requiredRule: ValidationRule[] = [
        { validate: validators.required, message: { en: "This field is required", sr: "Ovo polje je obavezno" } },
    ];

    const pairRequiredRule: ValidationRule[] = [
        {
            validate: validators.required,
            message: {
                en: "Both languages are required if one is filled",
                sr: "Oba jezika su obavezna ako je jedno popunjeno",
            },
        },
    ];

    const getErr = (field: string, value: string) =>
        formTouched[field] ? getFieldError(value, requiredRule, language) : null;

    const getPairErr = (field: string, value: string, otherValue: string) => {
        if (!formTouched[field]) return null;
        if (otherValue.trim() && !value.trim()) {
            return getFieldError(value, pairRequiredRule, language);
        }
        return null;
    };

    const selectedCategory = categories.find((c) => c.id === formData.category);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open && isSubmitting) return; // Prevent closing while submitting
                setIsOpen(open);
                if (!open) resetForm();
            }}
        >
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    {language === "en" ? "Add Product" : "Dodaj Proizvod"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] p-0 overflow-hidden" aria-describedby={undefined}>
                <div className="flex flex-col h-full max-h-[95vh] overflow-y-auto p-6">
                    <DialogHeader className="mb-4">
                        <DialogTitle>
                            {editingProduct
                                ? language === "en"
                                    ? "Edit Product"
                                    : "Izmeni Proizvod"
                                : language === "en"
                                    ? "Add New Product"
                                    : "Dodaj Novi Proizvod"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={onSubmit} className="space-y-4" noValidate>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "Name (SR)" : "Ime (SR)"}</label>
                                <Input
                                    value={formData.namesr}
                                    onChange={(e) => setFormData({ ...formData, namesr: e.target.value })}
                                    onBlur={() => markFormTouched("nameSr")}
                                    required
                                />
                                {getErr("nameSr", formData.namesr) && (
                                    <p className="text-xs text-destructive mt-1">{getErr("nameSr", formData.namesr)}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "Name (EN)" : "Ime (EN)"}</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    onBlur={() => markFormTouched("nameEn")}
                                    required
                                />
                                {getErr("nameEn", formData.name) && (
                                    <p className="text-xs text-destructive mt-1">{getErr("nameEn", formData.name)}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Subtitle (SR) - Optional" : "Podnaslov (SR) - Opciono"}
                                </label>
                                <Input
                                    value={formData.subtitleSr}
                                    onChange={(e) => setFormData({ ...formData, subtitleSr: e.target.value })}
                                    onBlur={() => markFormTouched("subtitleSr")}
                                />
                                {getPairErr("subtitleSr", formData.subtitleSr, formData.subtitleEn) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("subtitleSr", formData.subtitleSr, formData.subtitleEn)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Subtitle (EN) - Optional" : "Podnaslov (EN) - Opciono"}
                                </label>
                                <Input
                                    value={formData.subtitleEn}
                                    onChange={(e) => setFormData({ ...formData, subtitleEn: e.target.value })}
                                    onBlur={() => markFormTouched("subtitleEn")}
                                />
                                {getPairErr("subtitleEn", formData.subtitleEn, formData.subtitleSr) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("subtitleEn", formData.subtitleEn, formData.subtitleSr)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Description (SR) - Optional" : "Opis (SR) - Opciono"}
                                </label>
                                <Textarea
                                    value={formData.descriptionSr}
                                    onChange={(e) => setFormData({ ...formData, descriptionSr: e.target.value })}
                                    onBlur={() => markFormTouched("descSr")}
                                />
                                {getPairErr("descSr", formData.descriptionSr, formData.descriptionEn) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("descSr", formData.descriptionSr, formData.descriptionEn)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Description (EN) - Optional" : "Opis (EN) - Opciono"}
                                </label>
                                <Textarea
                                    value={formData.descriptionEn}
                                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                    onBlur={() => markFormTouched("descEn")}
                                />
                                {getPairErr("descEn", formData.descriptionEn, formData.descriptionSr) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("descEn", formData.descriptionEn, formData.descriptionSr)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Note Title (SR) - Optional" : "Naziv za napomenu (SR) - Opciono"}
                                </label>
                                <Input
                                    value={formData.additionalTitleSr}
                                    onChange={(e) => setFormData({ ...formData, additionalTitleSr: e.target.value })}
                                    onBlur={() => markFormTouched("additionalTitleSr")}
                                />
                                {getPairErr("additionalTitleSr", formData.additionalTitleSr, formData.additionalTitleEn) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("additionalTitleSr", formData.additionalTitleSr, formData.additionalTitleEn)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Note Title (EN) - Optional" : "Naziv za napomenu (EN) - Opciono"}
                                </label>
                                <Input
                                    value={formData.additionalTitleEn}
                                    onChange={(e) => setFormData({ ...formData, additionalTitleEn: e.target.value })}
                                    onBlur={() => markFormTouched("additionalTitleEn")}
                                />
                                {getPairErr("additionalTitleEn", formData.additionalTitleEn, formData.additionalTitleSr) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("additionalTitleEn", formData.additionalTitleEn, formData.additionalTitleSr)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Note (SR) - Optional" : "Napomena (SR) - Opciono"}
                                </label>
                                <Textarea
                                    value={formData.noteSubSr}
                                    onChange={(e) => setFormData({ ...formData, noteSubSr: e.target.value })}
                                    onBlur={() => markFormTouched("noteSubSr")}
                                />
                                {getPairErr("noteSubSr", formData.noteSubSr, formData.noteSubEn) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("noteSubSr", formData.noteSubSr, formData.noteSubEn)}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Note (EN) - Optional" : "Napomena (EN) - Opciono"}
                                </label>
                                <Textarea
                                    value={formData.noteSubEn}
                                    onChange={(e) => setFormData({ ...formData, noteSubEn: e.target.value })}
                                    onBlur={() => markFormTouched("noteSubEn")}
                                />
                                {getPairErr("noteSubEn", formData.noteSubEn, formData.noteSubSr) && (
                                    <p className="text-xs text-destructive mt-1">
                                        {getPairErr("noteSubEn", formData.noteSubEn, formData.noteSubSr)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium">Lot #</label>
                                <Input value={formData.lot} onChange={(e) => setFormData({ ...formData, lot: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">
                                    {language === "en" ? "Catalog Mark - Optional" : "Kataloška Oznaka - Opciono"}
                                </label>
                                <Input
                                    value={formData.catalogMark}
                                    onChange={(e) => setFormData({ ...formData, catalogMark: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "State" : "Stanje"}</label>
                                <Select
                                    value={formData.lotState}
                                    onValueChange={(value) => setFormData({ ...formData, lotState: value as LotState })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lotStateOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                {language === "en" ? opt.labelEn : opt.labelSr}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium">{language === "en" ? "Starting Price" : "Početna cena"}</label>
                            <Input
                                type="number"
                                value={formData.currentBid}
                                onChange={(e) => setFormData({ ...formData, currentBid: e.target.value })}
                                onBlur={() => markFormTouched("currentBid")}
                                required
                            />
                            {getErr("currentBid", formData.currentBid) && (
                                <p className="text-xs text-destructive mt-1">{getErr("currentBid", formData.currentBid)}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "Category" : "Kategorija"}</label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value, subcategory: "" })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={language === "en" ? "Select category" : "Izaberi kategoriju"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories
                                            .filter((cat) => cat.isActive)
                                            .map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.title[language]}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">{language === "en" ? "Subcategory" : "Podkategorija"}</label>
                                <Select
                                    value={formData.subcategory}
                                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                                    disabled={!formData.category}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={language === "en" ? "Select subcategory" : "Izaberi podkategoriju"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedCategory?.subcategories
                                            .filter((sub) => sub.isActive)
                                            .map((sub) => (
                                                <SelectItem key={sub.id} value={sub.id}>
                                                    {sub.title[language]}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <ImageDropzone
                            images={uploadedImages}
                            onChange={setUploadedImages}
                            maxImages={5}
                            error={
                                formTouched["images"] && uploadedImages.length === 0
                                    ? language === "en"
                                        ? "At least one image is required"
                                        : "Bar jedna slika je obavezna"
                                    : null
                            }
                        />

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {editingProduct
                                ? language === "en"
                                    ? "Update Product"
                                    : "Ažuriraj Proizvod"
                                : language === "en"
                                    ? "Create Product"
                                    : "Kreiraj Proizvod"}
                        </Button>
                    </form>
                </div>
                {isSubmitting && (
                    <div className="absolute inset-0 z-[51] flex justify-center items-center bg-background/50 backdrop-blur-sm">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

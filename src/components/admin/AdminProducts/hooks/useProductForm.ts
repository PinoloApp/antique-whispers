import { useState, useCallback } from "react";
import { Product } from "@/contexts/DataContext";
import { ProductService } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { ProductFormData } from "../types";

export interface UseProductFormOptions {
    onSuccessCreate?: (product: Product) => void;
    onSuccessUpdate?: (product: Product) => void;
}

export const useProductForm = (language: "en" | "sr", options?: UseProductFormOptions) => {
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        namesr: "",
        descriptionEn: "",
        descriptionSr: "",
        lot: "",
        currentBid: "",
        category: "",
        subcategory: "",
        auctionId: "",
        catalogMark: "",
        lotState: "antique",
        status: "available",
        subtitleEn: "",
        subtitleSr: "",
        additionalTitleEn: "",
        additionalTitleSr: "",
        noteSubEn: "",
        noteSubSr: "",
    });

    const resetForm = useCallback(() => {
        setFormData({
            name: "",
            namesr: "",
            descriptionEn: "",
            descriptionSr: "",
            lot: "",
            currentBid: "",
            category: "",
            subcategory: "",
            auctionId: "",
            catalogMark: "",
            lotState: "antique",
            status: "available",
            subtitleEn: "",
            subtitleSr: "",
            additionalTitleEn: "",
            additionalTitleSr: "",
            noteSubEn: "",
            noteSubSr: "",
        });
        setUploadedImages([]);
        setEditingProduct(null);
        setFormTouched({});
    }, []);

    const handleEdit = useCallback((product: Product) => {
        setEditingProduct(product);
        setUploadedImages(product.images || [product.image]);
        setFormData({
            name: product.name,
            namesr: product.namesr,
            descriptionEn: product.description.en,
            descriptionSr: product.description.sr,
            lot: product.lot,
            currentBid: product.currentBid.toString(),
            category: product.category,
            subcategory: product.subcategory,
            auctionId: product.auctionId.toString(),
            catalogMark: product.catalogMark || "",
            lotState: product.lotState || "antique",
            status: product.status || "available",
            subtitleEn: product.subtitle?.en || "",
            subtitleSr: product.subtitle?.sr || "",
            additionalTitleEn: product.additionalTitle?.en || "",
            additionalTitleSr: product.additionalTitle?.sr || "",
            noteSubEn: product.noteSub?.en || "",
            noteSubSr: product.noteSub?.sr || "",
        });
        setIsOpen(true);
    }, []);

    const markFormTouched = (field: string) => setFormTouched((prev) => ({ ...prev, [field]: true }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const allFields = [
            "nameSr",
            "nameEn",
            "currentBid",
            "images",
            "subtitleSr",
            "subtitleEn",
            "descSr",
            "descEn",
            "additionalTitleSr",
            "additionalTitleEn",
            "noteSubSr",
            "noteSubEn",
        ];
        const allTouched = Object.fromEntries(allFields.map((f) => [f, true]));
        setFormTouched((prev) => ({ ...prev, ...allTouched }));

        // Required: name SR/EN, starting price
        if (!formData.namesr.trim() || !formData.name.trim() || !formData.currentBid.trim()) return;

        // Paired optional: if one language filled, other is required
        const pairCheck = (a: string, b: string) => (a.trim() || b.trim() ? a.trim() && b.trim() : true);
        if (!pairCheck(formData.subtitleSr, formData.subtitleEn)) return;
        if (!pairCheck(formData.descriptionSr, formData.descriptionEn)) return;
        if (!pairCheck(formData.additionalTitleSr, formData.additionalTitleEn)) return;
        if (!pairCheck(formData.noteSubSr, formData.noteSubEn)) return;

        if (uploadedImages.length === 0) return;

        setIsSubmitting(true);
        try {
            const productData: Product = {
                id: editingProduct?.id || Date.now(),
                name: formData.name,
                namesr: formData.namesr,
                description: { en: formData.descriptionEn, sr: formData.descriptionSr },
                lot: formData.lot,
                currentBid: Number(formData.currentBid),
                startingPrice: Number(formData.currentBid),
                hasBids: editingProduct?.hasBids || false,
                image: uploadedImages[0],
                images: uploadedImages,
                category: formData.category,
                subcategory: formData.subcategory,
                auctionId: Number(formData.auctionId),
                catalogMark: formData.catalogMark,
                lotState: formData.lotState,
                status: formData.status,
                ...(formData.subtitleEn || formData.subtitleSr
                    ? {
                        subtitle: { en: formData.subtitleEn, sr: formData.subtitleSr },
                    }
                    : {}),
                ...(formData.additionalTitleEn || formData.additionalTitleSr
                    ? {
                        additionalTitle: { en: formData.additionalTitleEn, sr: formData.additionalTitleSr },
                    }
                    : {}),
                ...(formData.noteSubEn || formData.noteSubSr
                    ? {
                        noteSub: { en: formData.noteSubEn, sr: formData.noteSubSr },
                    }
                    : {}),
            };

            if (editingProduct) {
                await ProductService.update(editingProduct.id, productData);
                toast({
                    title: language === "en" ? "Product Updated" : "Proizvod Ažuriran",
                    description: language === "en" ? "The product has been updated successfully." : "Proizvod je uspešno ažuriran.",
                });
                if (options?.onSuccessUpdate) {
                    options.onSuccessUpdate(productData);
                }
            } else {
                await ProductService.create(productData);
                toast({
                    title: language === "en" ? "Product Created" : "Proizvod Kreiran",
                    description: language === "en" ? "The product has been created successfully." : "Proizvod je uspešno kreiran.",
                });
                if (options?.onSuccessCreate) {
                    options.onSuccessCreate(productData);
                }
            }

            setIsOpen(false);
            resetForm();
        } catch (error) {
            console.error("Error saving product:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to save product. Please try again." : "Greška pri čuvanju proizvoda. Pokušajte ponovo.",
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
        editingProduct,
        setEditingProduct,
        formData,
        setFormData,
        uploadedImages,
        setUploadedImages,
        formTouched,
        setFormTouched,
        markFormTouched,
        resetForm,
        handleEdit,
        handleSubmit,
    };
};

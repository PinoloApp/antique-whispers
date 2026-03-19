import { useState, useCallback } from "react";
import { Product, Collection } from "@/contexts/DataContext";
import { ProductService } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { uploadBase64Image, deleteStorageFile } from "@/utils/storageUtils";
import { ProductFormData } from "../types";


export interface UseProductFormOptions {
    onSuccessCreate?: (product: Product) => void;
    onSuccessUpdate?: (product: Product) => void;
}

export const useProductForm = (language: "en" | "sr", allProducts: Product[], allCollections: Collection[], options?: UseProductFormOptions) => {
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
        startingPrice: "",
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
            startingPrice: "",
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
            startingPrice: product.startingPrice.toString(),
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
            "startingPrice",
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
        if (!formData.namesr.trim() || !formData.name.trim() || !formData.startingPrice.trim()) return;


        // Paired optional: if one language filled, other is required
        const pairCheck = (a: string, b: string) => (a.trim() || b.trim() ? a.trim() && b.trim() : true);
        if (!pairCheck(formData.subtitleSr, formData.subtitleEn)) return;
        if (!pairCheck(formData.descriptionSr, formData.descriptionEn)) return;
        if (!pairCheck(formData.additionalTitleSr, formData.additionalTitleEn)) return;
        if (!pairCheck(formData.noteSubSr, formData.noteSubEn)) return;

        if (uploadedImages.length === 0) return;

        setIsSubmitting(true);
        try {
            const productId = editingProduct?.id || Date.now();
            const newUploadedImages: string[] = [];

            // 1. Handle image deletions (if editing)
            if (editingProduct) {
                const removedImages = (editingProduct.images || []).filter(
                    (oldImg) => !uploadedImages.includes(oldImg)
                );
                await Promise.all(removedImages.map((img) => deleteStorageFile(img)));
            }

            // 2. Upload new images
            for (let i = 0; i < uploadedImages.length; i++) {
                const img = uploadedImages[i];
                if (img.startsWith("data:image")) {
                    const uploadedUrl = await uploadBase64Image(
                        img,
                        `products/${productId}/image_${Date.now()}_${i}`
                    );
                    newUploadedImages.push(uploadedUrl);
                } else {
                    newUploadedImages.push(img);
                }
            }

            const productData: Product = {
                id: productId,
                name: formData.name,
                namesr: formData.namesr,
                description: { en: formData.descriptionEn, sr: formData.descriptionSr },
                lot: formData.lot,
                startingPrice: Number(formData.startingPrice),
                currentBid: editingProduct?.hasBids ? editingProduct.currentBid : Number(formData.startingPrice),
                hasBids: editingProduct?.hasBids || false,
                image: newUploadedImages[0],
                images: newUploadedImages,
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

    const toggleOpen = useCallback((open: boolean) => {
        setIsOpen(open);

    }, [editingProduct, allProducts, allCollections]);

    return {
        isSubmitting,
        isOpen,
        setIsOpen: toggleOpen,
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

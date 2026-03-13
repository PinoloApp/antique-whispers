import { useState, useRef, useEffect } from "react";
import { Collection, Product } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { getFieldError, validators, type ValidationRule } from "@/lib/validation";
import { CollectionService } from "@/services/collectionService";
import { CollectionProductService } from "@/services/collectionProductService";
import { storage } from "@/firebase/firebase";
import { compressImage } from "@/utils/imageUtils";
import { uploadBase64Image, deleteStorageFile } from "@/utils/storageUtils";

export interface InlineLot {
    tempId: string;
    nameSr: string;
    nameEn: string;
    descriptionSr: string;
    descriptionEn: string;
    image: string;
}

export interface UseCollectionFormOptions {
    onSuccessCreate?: (collection: Collection) => void;
    onSuccessUpdate?: (collection: Collection) => void;
}

export const useCollectionForm = (
    language: "en" | "sr",
    allCollections: Collection[],
    allProducts: Product[],
    options?: UseCollectionFormOptions
) => {
    const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);

    useEffect(() => {
        const unsubscribe = CollectionProductService.subscribeAll((data) => {
            setCollectionProducts(data);
        });
        return () => unsubscribe();
    }, []);

    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

    const [formData, setFormData] = useState({
        nameSr: "",
        nameEn: "",
        descriptionSr: "",
        descriptionEn: "",
        lotNumber: "",
        startingPrice: "",
        category: "",
        subcategory: "",
    });

    const [collectionImage, setCollectionImage] = useState<string>("");
    const [inlineLots, setInlineLots] = useState<InlineLot[]>([]);
    const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

    const [pendingCollectionData, setPendingCollectionData] = useState<Collection | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const markFormTouched = (field: string) => setFormTouched((prev) => ({ ...prev, [field]: true }));

    const requiredRule: ValidationRule[] = [
        { validate: validators.required, message: { en: "This field is required", sr: "Ovo polje je obavezno" } },
    ];
    const priceRule: ValidationRule[] = [
        { validate: validators.required, message: { en: "Starting price is required", sr: "Početna cena je obavezna" } },
        { validate: validators.minNumber(0.01), message: { en: "Price must be greater than 0", sr: "Cena mora biti veća od 0" } },
    ];
    const pairRequiredRule: ValidationRule[] = [
        { validate: validators.required, message: { en: "Both languages are required if one is filled", sr: "Oba jezika su obavezna ako je jedno popunjeno" } },
    ];

    const getErr = (field: string, value: string, rules: ValidationRule[] = requiredRule) =>
        formTouched[field] ? getFieldError(value, rules, language) : null;

    const getLotErr = (lotId: string, field: string, value: string) =>
        formTouched[`lot_${lotId}_${field}`] ? getFieldError(value, requiredRule, language) : null;

    const getPairErr = (field: string, value: string, otherValue: string) => {
        if (!formTouched[field]) return null;
        if (otherValue.trim() && !value.trim()) {
            return getFieldError(value, pairRequiredRule, language);
        }
        return null;
    };

    const collectionImageRef = useRef<HTMLInputElement>(null);
    const lotImageRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const resetForm = () => {
        setFormData({ nameSr: "", nameEn: "", descriptionSr: "", descriptionEn: "", lotNumber: "", startingPrice: "", category: "", subcategory: "" });
        setCollectionImage("");
        setInlineLots([]);
        setEditingCollection(null);
        setFormTouched({});
    };

    const handleEdit = (collection: Collection) => {
        setEditingCollection(collection);
        setFormData({
            nameSr: collection.name.sr,
            nameEn: collection.name.en,
            descriptionSr: collection.description.sr,
            descriptionEn: collection.description.en,
            lotNumber: collection.lotNumber,
            startingPrice: collection.startingPrice.toString(),
            category: collection.category || "",
            subcategory: collection.subcategory || "",
        });
        setCollectionImage(collection.image || "");

        const existingLots: InlineLot[] = collection.productIds.map((pid) => {
            const p = collectionProducts.find((pr) => pr.id === pid);
            return {
                tempId: `existing-${pid}`,
                nameSr: p?.namesr || "",
                nameEn: p?.name || "",
                descriptionSr: p?.description.sr || "",
                descriptionEn: p?.description.en || "",
                image: p?.image || "",
            };
        });
        setInlineLots(existingLots);
        setIsOpen(true);
    };

    const addInlineLot = () => {
        setInlineLots((prev) => [...prev, { tempId: `lot-${Date.now()}`, nameSr: "", nameEn: "", descriptionSr: "", descriptionEn: "", image: "" }]);
        setTimeout(() => {
            const formEl = document.querySelector('[data-collection-form]');
            if (formEl) formEl.scrollTop = formEl.scrollHeight;
        }, 50);
    };

    const updateInlineLot = (tempId: string, field: keyof InlineLot, value: string) => {
        setInlineLots((prev) => prev.map((l) => l.tempId === tempId ? { ...l, [field]: value } : l));
    };

    const removeInlineLot = (tempId: string) => {
        setInlineLots((prev) => prev.filter((l) => l.tempId !== tempId));
    };

    const handleLotImageUpload = async (tempId: string, file: File) => {
        try {
            const compressed = await compressImage(file);
            updateInlineLot(tempId, "image", compressed);
        } catch (error) {
            console.error("Error compressing lot image:", error);
        }
    };

    const handleCollectionImageUpload = async (file: File) => {
        try {
            const compressed = await compressImage(file);
            setCollectionImage(compressed);
        } catch (error) {
            console.error("Error compressing collection image:", error);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Mark all fields touched
        const allFields = ["nameSr", "nameEn", "descSr", "descEn", "startingPrice"];
        const allTouched = Object.fromEntries(allFields.map((f) => [f, true]));
        setFormTouched((prev) => ({ ...prev, ...allTouched }));

        // Validate required fields
        const hasNameErr = getFieldError(formData.nameSr, requiredRule, language) || getFieldError(formData.nameEn, requiredRule, language);
        const hasPriceErr = getFieldError(formData.startingPrice, priceRule, language);

        // Paired optional: descriptions
        const hasDescPairErr =
            (formData.descriptionEn.trim() && !formData.descriptionSr.trim()) ||
            (formData.descriptionSr.trim() && !formData.descriptionEn.trim());

        // Mark no-lots touched
        setFormTouched((prev) => ({ ...prev, noLots: true }));

        if (hasNameErr || hasPriceErr || hasDescPairErr) {
            return;
        }

        // Must have at least one lot
        if (inlineLots.length === 0) {
            return;
        }

        // Validate inline lots - mark all lot fields as touched
        let hasLotErrors = false;
        for (const lot of inlineLots) {
            const lotTouched: Record<string, boolean> = {};
            for (const f of ["nameSr", "nameEn", "descriptionSr", "descriptionEn", "image"]) {
                lotTouched[`lot_${lot.tempId}_${f}`] = true;
            }
            setFormTouched((prev) => ({ ...prev, ...lotTouched }));
            if (!lot.nameSr.trim() || !lot.nameEn.trim() || !lot.descriptionSr.trim() || !lot.descriptionEn.trim() || !lot.image) {
                hasLotErrors = true;
            }
        }
        if (hasLotErrors) return;



        const collectionData: Collection = {
            id: editingCollection?.id || Date.now(),
            name: { en: formData.nameEn.trim(), sr: formData.nameSr.trim() },
            description: { en: formData.descriptionEn.trim(), sr: formData.descriptionSr.trim() },
            lotNumber: formData.lotNumber.trim(),
            startingPrice: parseFloat(formData.startingPrice),
            currentBid: editingCollection?.currentBid || parseFloat(formData.startingPrice),
            productIds: editingCollection?.productIds || [],
            image: collectionImage || undefined,
            status: editingCollection?.status || "available",
            hasBids: editingCollection?.hasBids || false,
            auctionId: editingCollection?.auctionId || 0,
            category: formData.category,
            subcategory: formData.subcategory,
            createdAt: editingCollection?.createdAt || new Date(),
        };

        setPendingCollectionData(collectionData);
        if (editingCollection) {
            setUpdateDialogOpen(true);
        } else {
            setCreateDialogOpen(true);
        }
    };

    const handleCreateConfirm = async () => {
        setCreateDialogOpen(false);
        if (isSubmitting) return; // Prevent concurrent submissions
        if (pendingCollectionData) {
            setIsSubmitting(true);
            try {
                // Determine a new custom ID. Max existing ID + 1.
                let nextId = 1;
                if (allCollections.length > 0) {
                    const maxId = Math.max(...allCollections.map(c => typeof c.id === 'string' ? parseInt(c.id, 10) || 0 : c.id));
                    nextId = maxId + 1;
                }

                // Upload Collection Image if present
                let imageUrl = pendingCollectionData.image;
                if (imageUrl && imageUrl.startsWith('data:image')) {
                    imageUrl = await uploadBase64Image(imageUrl, `collections/${nextId}/main_image_${Date.now()}`);
                }

                const newProductIds: number[] = [];
                // Process inline lots into Products
                for (let index = 0; index < inlineLots.length; index++) {
                    const lot = inlineLots[index];
                    const productId = Date.now() + index + 1;

                    let lotImageUrl = lot.image;
                    if (lotImageUrl && lotImageUrl.startsWith('data:image')) {
                        lotImageUrl = await uploadBase64Image(lotImageUrl, `collectionProducts/${productId}/main_image_${Date.now()}`);
                    }

                    await CollectionProductService.create(productId, {
                        name: lot.nameEn,
                        namesr: lot.nameSr,
                        description: { en: lot.descriptionEn, sr: lot.descriptionSr },
                        lot: pendingCollectionData.lotNumber,
                        startingPrice: pendingCollectionData.startingPrice,
                        currentBid: pendingCollectionData.startingPrice,
                        hasBids: false,
                        image: lotImageUrl || "",
                        images: lotImageUrl ? [lotImageUrl] : [],
                        category: pendingCollectionData.category || "ostalo",
                        subcategory: pendingCollectionData.subcategory || "ostalo",
                        auctionId: pendingCollectionData.auctionId || 0,
                        catalogMark: `${pendingCollectionData.lotNumber}-${index + 1}`,
                        lotState: "new",
                        status: "available",
                    });

                    newProductIds.push(productId);
                }

                const dataToSave = {
                    ...pendingCollectionData,
                    id: nextId,
                    productIds: newProductIds,
                };

                // Firestore doesn't accept undefined, must be null or removed
                if (imageUrl !== undefined) {
                    dataToSave.image = imageUrl;
                } else {
                    delete dataToSave.image;
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...dataWithoutId } = dataToSave;

                await CollectionService.create(nextId, dataWithoutId);

                toast({
                    title: language === "en" ? "Collection Created" : "Kolekcija Kreirana",
                    description: language === "en" ? "The collection has been created successfully." : "Kolekcija je uspešno kreirana.",
                });

                if (options?.onSuccessCreate) {
                    options.onSuccessCreate(dataToSave);
                }

                setIsOpen(false);
                resetForm();
            } catch (error) {
                console.error("Error creating collection", error);
                toast({
                    title: language === "en" ? "Error" : "Greška",
                    description: language === "en" ? "Failed to create collection." : "Greška pri kreiranju kolekcije.",
                    variant: "destructive",
                });
            } finally {
                setIsSubmitting(false);
            }
        }
        setCreateDialogOpen(false);
        setPendingCollectionData(null);
    };

    const handleUpdateConfirm = async () => {
        setUpdateDialogOpen(false);
        if (isSubmitting) return; // Prevent concurrent submissions
        if (pendingCollectionData && editingCollection) {
            setIsSubmitting(true);
            try {
                const oldCollectionImage = editingCollection.image;

                // Upload Collection Image if changed
                let imageUrl = pendingCollectionData.image;
                if (imageUrl && imageUrl.startsWith('data:image')) {
                    // New image uploaded - delete old one from Storage
                    if (oldCollectionImage) {
                        await deleteStorageFile(oldCollectionImage);
                    }
                    imageUrl = await uploadBase64Image(imageUrl, `collections/${editingCollection.id}/main_image_${Date.now()}`);
                } else if (!imageUrl && oldCollectionImage) {
                    // Image was removed - delete from Storage
                    await deleteStorageFile(oldCollectionImage);
                }

                const newProductIds: number[] = [];

                for (let index = 0; index < inlineLots.length; index++) {
                    const lot = inlineLots[index];
                    const productId = lot.tempId.startsWith('existing-')
                        ? parseInt(lot.tempId.replace('existing-', ''))
                        : Date.now() + index + 1;

                    let lotImageUrl = lot.image;
                    if (lotImageUrl && lotImageUrl.startsWith('data:image')) {
                        // New lot image - delete old one if this is an existing lot
                        if (lot.tempId.startsWith('existing-')) {
                            const oldProduct = collectionProducts.find((p) => p.id === productId);
                            if (oldProduct?.image) {
                                await deleteStorageFile(oldProduct.image);
                            }
                        }
                        lotImageUrl = await uploadBase64Image(lotImageUrl, `collectionProducts/${productId}/main_image_${Date.now()}`);
                    }

                    if (lot.tempId.startsWith('existing-')) {
                        await CollectionProductService.update(productId, {
                            name: lot.nameEn,
                            namesr: lot.nameSr,
                            description: { en: lot.descriptionEn, sr: lot.descriptionSr },
                            image: lotImageUrl || "",
                            images: lotImageUrl ? [lotImageUrl] : [],
                        });
                    } else {
                        await CollectionProductService.create(productId, {
                            name: lot.nameEn,
                            namesr: lot.nameSr,
                            description: { en: lot.descriptionEn, sr: lot.descriptionSr },
                            lot: editingCollection.lotNumber,
                            startingPrice: editingCollection.startingPrice,
                            currentBid: editingCollection.startingPrice,
                            hasBids: false,
                            image: lotImageUrl || "",
                            images: lotImageUrl ? [lotImageUrl] : [],
                            category: editingCollection.category || "ostalo",
                            subcategory: editingCollection.subcategory || "ostalo",
                            auctionId: editingCollection.auctionId || 0,
                            catalogMark: `${editingCollection.lotNumber}-${index + 1}`,
                            lotState: "new",
                            status: "available",
                        });
                    }
                    newProductIds.push(productId);
                }

                // Delete removed lots from Firestore and Storage
                const oldProductIds = editingCollection.productIds || [];
                const removedProductIds = oldProductIds.filter((pid) => !newProductIds.includes(pid));
                await Promise.all(
                    removedProductIds.map((pid) => CollectionProductService.deleteWithStorage(pid))
                );

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...updates } = pendingCollectionData;
                updates.productIds = newProductIds;

                // Handle image field
                if (imageUrl) {
                    updates.image = imageUrl;
                } else {
                    updates.image = "" as any;
                }

                await CollectionService.update(editingCollection.id, updates);

                toast({
                    title: language === "en" ? "Collection Updated" : "Kolekcija Ažurirana",
                    description: language === "en" ? "The collection has been updated successfully." : "Kolekcija je uspešno ažurirana.",
                });

                if (options?.onSuccessUpdate) {
                    options.onSuccessUpdate({ ...editingCollection, ...updates } as Collection);
                }

                setIsOpen(false);
                resetForm();
            } catch (error) {
                console.error("Error updating collection", error);
                toast({
                    title: language === "en" ? "Error" : "Greška",
                    description: language === "en" ? "Failed to update collection." : "Greška pri ažuriranju kolekcije.",
                    variant: "destructive",
                });
            } finally {
                setIsSubmitting(false);
            }
        }
        setUpdateDialogOpen(false);
        setPendingCollectionData(null);
    };

    const toggleOpen = (open: boolean) => {
        setIsOpen(open);

    };

    return {
        isSubmitting,
        isOpen,
        setIsOpen: toggleOpen,
        editingCollection,
        setEditingCollection,
        formData,
        setFormData,
        collectionImage,
        setCollectionImage,
        inlineLots,
        setInlineLots,
        formTouched,
        setFormTouched,
        markFormTouched,
        collectionImageRef,
        lotImageRefs,
        resetForm,
        handleEdit,
        addInlineLot,
        updateInlineLot,
        removeInlineLot,
        handleLotImageUpload,
        handleCollectionImageUpload,
        pendingCollectionData,
        setPendingCollectionData,
        createDialogOpen,
        setCreateDialogOpen,
        updateDialogOpen,
        setUpdateDialogOpen,
        handleSubmit,
        handleCreateConfirm,
        handleUpdateConfirm,
        allCollections,
        getErr,
        getLotErr,
        getPairErr,
        priceRule
    };
};

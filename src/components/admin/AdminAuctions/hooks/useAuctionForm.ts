import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Auction, BidStep, Product, Collection, Category, Subcategory } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { getFieldError, type ValidationRule, validators } from "@/lib/validation";

export const useAuctionForm = (
    language: "en" | "sr",
    products: Product[],
    collections: Collection[],
    categories: Category[],
    onSubmit: (auction: Auction, isEdit: boolean) => void,
) => {
    const { toast } = useToast();

    const defaultBidSteps: BidStep[] = [
        { fromAmount: 0, toAmount: 99, step: 5 },
        { fromAmount: 100, toAmount: 199, step: 10 },
        { fromAmount: 200, toAmount: Infinity, step: 20 },
    ];

    const [isOpen, setIsOpen] = useState(false);
    const [editingAuction, setEditingAuction] = useState<Auction | null>(null);

    const getInitialStartDateTime = () => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        return {
            date: format(oneHourLater, "yyyy-MM-dd"),
            time: format(oneHourLater, "HH:mm")
        };
    };

    const initialStart = getInitialStartDateTime();

    const [formData, setFormData] = useState({
        titleEn: "",
        titleSr: "",
        descriptionEn: "",
        descriptionSr: "",
        startDate: initialStart.date,
        startTime: initialStart.time,
        endDate: "",
        endTime: "18:00",
    });
    const [selectedLots, setSelectedLots] = useState<number[]>([]);
    const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
    const [collectionSearch, setCollectionSearch] = useState("");
    const [bidSteps, setBidSteps] = useState<BidStep[]>(defaultBidSteps);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
    const [expandedColCategories, setExpandedColCategories] = useState<string[]>([]);
    const [expandedColSubcategories, setExpandedColSubcategories] = useState<string[]>([]);
    const [lotsExpanded, setLotsExpanded] = useState(false);
    const [formLotSearch, setFormLotSearch] = useState("");
    const [stepsExpanded, setStepsExpanded] = useState(false);
    const [collectionsExpanded, setCollectionsExpanded] = useState(false);
    const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});

    const markFormTouched = (field: string) => setFormTouched((prev) => ({ ...prev, [field]: true }));

    const requiredRule: ValidationRule[] = [
        { validate: validators.required, message: { en: "This field is required", sr: "Ovo polje je obavezno" } },
    ];
    const getErr = (field: string, value: string) =>
        formTouched[field] ? getFieldError(value, requiredRule, language) : null;

    const getDateError = (field: "startDate" | "endDate" | "startTime" | "endTime"): string | null => {
        if (!formTouched[field]) return null;

        if ((field === "startDate" || field === "endDate") && !formData[field]) {
            return language === "en" ? "This field is required" : "Ovo polje je obavezno";
        }
        if ((field === "startTime" || field === "endTime") && !formData[field]) {
            return language === "en" ? "This field is required" : "Ovo polje je obavezno";
        }

        if (field === "startDate" && formData.startDate) {
            const startDT = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
            const now = new Date();

            // Skip past date check if already active
            const isAlreadyActive = editingAuction?.status === "active";

            if (!isAlreadyActive) {
                const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
                if (startDT < oneHourLater) {
                    return language === "en"
                        ? "Start must be at least 1 hour from now"
                        : "Početak mora biti barem sat vremena od sada";
                }
            }
        }

        if ((field === "endDate" || field === "endTime") && formData.startDate && formData.endDate) {
            const startDT = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
            const endDT = new Date(`${formData.endDate}T${formData.endTime || "00:00"}`);
            if (endDT <= startDT) {
                return language === "en" ? "End must be after start" : "Završetak mora biti posle početka";
            }
        }

        return null;
    };

    const collectionProductIds = new Set(collections.flatMap((c) => c.productIds));

    const originalLotIds = new Set(editingAuction?.lotIds || []);
    const originalCollectionIds = new Set(editingAuction?.collectionIds || []);

    const availableProducts = products.filter(
        (p) =>
            (p.status === "available" || selectedLots.includes(p.id) || originalLotIds.has(p.id)) &&
            !collectionProductIds.has(p.id),
    );

    const availableCollections = collections.filter(
        (c) => c.status === "available" || selectedCollections.includes(c.id) || originalCollectionIds.has(c.id),
    );

    // Sync selections if items become unavailable or are moved to another auction
    useEffect(() => {
        if (selectedLots.length > 0) {
            const validLotIds = new Set(availableProducts.map(p => p.id));
            const newSelectedLots = selectedLots.filter(id => validLotIds.has(id));
            if (newSelectedLots.length !== selectedLots.length) {
                setSelectedLots(newSelectedLots);
            }
        }

        if (selectedCollections.length > 0) {
            const validColIds = new Set(availableCollections.map(c => c.id));
            const newSelectedCollections = selectedCollections.filter(id => validColIds.has(id));
            if (newSelectedCollections.length !== selectedCollections.length) {
                setSelectedCollections(newSelectedCollections);
            }
        }
    }, [products, collections, editingAuction, availableProducts, availableCollections]);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories((prev) =>
            prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
        );
    };

    const toggleSubcategory = (subcategoryId: string) => {
        setExpandedSubcategories((prev) =>
            prev.includes(subcategoryId) ? prev.filter((id) => id !== subcategoryId) : [...prev, subcategoryId],
        );
    };

    const toggleLot = (productId: number) => {
        setSelectedLots((prev) =>
            prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
        );
    };

    const getProductsByCategory = (categoryId: string) => {
        return availableProducts.filter((p) => p.category === categoryId);
    };

    const getProductsBySubcategory = (categoryId: string, subcategoryId: string) => {
        return availableProducts.filter((p) => p.category === categoryId && p.subcategory === subcategoryId);
    };

    const getProductsWithoutSubcategory = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        const validSubcategoryIds = new Set(category?.subcategories.map((s) => s.id) ?? []);
        return availableProducts.filter(
            (p) =>
                p.category === categoryId &&
                (!p.subcategory || p.subcategory === "" || !validSubcategoryIds.has(p.subcategory)),
        );
    };

    const getSubcategoriesWithAvailableProducts = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        if (!category) return [];
        return category.subcategories.filter((sub) => {
            if (!sub.isActive) return false;
            return availableProducts.some((p) => p.category === categoryId && p.subcategory === sub.id);
        });
    };

    const isFormLotMatch = (product: Product) => {
        const q = formLotSearch.toLowerCase().trim();
        if (!q) return true;
        const cleanedQ = q.replace(/^lot\s*/i, "").trim();
        const qNoZeros = cleanedQ.replace(/^0+/, "");
        const lotNoZeros = product.lot?.replace(/^0+/, "") || "";

        const productMatch =
            product.lot?.toLowerCase().includes(q) ||
            product.lot?.toLowerCase().includes(cleanedQ) ||
            lotNoZeros.includes(qNoZeros) ||
            product.name.toLowerCase().includes(q) ||
            product.namesr.toLowerCase().includes(q) ||
            product.catalogMark?.toLowerCase().includes(q);
        if (productMatch) return true;

        const cat = categories.find((c) => c.id === product.category);
        if (cat && (cat.title.en.toLowerCase().includes(q) || cat.title.sr.toLowerCase().includes(q))) return true;

        if (cat && product.subcategory) {
            const sub = cat.subcategories.find((s) => s.id === product.subcategory);
            if (sub && (sub.title.en.toLowerCase().includes(q) || sub.title.sr.toLowerCase().includes(q))) return true;
        }

        return false;
    };

    const getFilteredProductsBySubcategory = (categoryId: string, subcategoryId: string) => {
        return getProductsBySubcategory(categoryId, subcategoryId).filter(isFormLotMatch);
    };

    const getFilteredProductsWithoutSubcategory = (categoryId: string) => {
        return getProductsWithoutSubcategory(categoryId).filter(isFormLotMatch);
    };

    const getCategoriesWithAvailableProducts = () => {
        return categories.filter((cat) => {
            if (!cat.isActive) return false;
            const hasDirectProducts = availableProducts.some(
                (p) => p.category === cat.id && (!p.subcategory || p.subcategory === ""),
            );
            const hasSubcategoriesWithProducts = cat.subcategories.some((sub) => {
                if (!sub.isActive) return false;
                return availableProducts.some((p) => p.category === cat.id && p.subcategory === sub.id);
            });

            return hasDirectProducts || hasSubcategoriesWithProducts;
        });
    };

    const getFilteredCategoriesWithAvailableProducts = () => {
        if (!formLotSearch.trim()) return getCategoriesWithAvailableProducts();
        const q = formLotSearch.toLowerCase().trim();
        return getCategoriesWithAvailableProducts().filter((cat) => {
            if (cat.title.en.toLowerCase().includes(q) || cat.title.sr.toLowerCase().includes(q)) return true;
            if (
                cat.subcategories.some(
                    (sub) => sub.title.en.toLowerCase().includes(q) || sub.title.sr.toLowerCase().includes(q),
                )
            )
                return true;
            return availableProducts.filter((p) => p.category === cat.id).some(isFormLotMatch);
        });
    };

    const getFilteredSubcategoriesWithAvailableProducts = (categoryId: string): Subcategory[] => {
        const subs = getSubcategoriesWithAvailableProducts(categoryId);
        if (!formLotSearch.trim()) return subs;
        const q = formLotSearch.toLowerCase().trim();
        return subs.filter((sub) => {
            if (sub.title.en.toLowerCase().includes(q) || sub.title.sr.toLowerCase().includes(q)) return true;
            return getProductsBySubcategory(categoryId, sub.id).some(isFormLotMatch);
        });
    };

    const selectAllInCategory = (categoryId: string) => {
        const categoryProductIds = getProductsByCategory(categoryId).map((p) => p.id);
        setSelectedLots((prev) => [...new Set([...prev, ...categoryProductIds])]);
    };

    const deselectAllInCategory = (categoryId: string) => {
        const categoryProductIds = getProductsByCategory(categoryId).map((p) => p.id);
        setSelectedLots((prev) => prev.filter((id) => !categoryProductIds.includes(id)));
    };

    const selectAllInSubcategory = (categoryId: string, subcategoryId: string) => {
        const subcategoryProductIds = getProductsBySubcategory(categoryId, subcategoryId).map((p) => p.id);
        setSelectedLots((prev) => [...new Set([...prev, ...subcategoryProductIds])]);
    };
    const deselectAllInSubcategory = (categoryId: string, subcategoryId: string) => {
        const subcategoryProductIds = getProductsBySubcategory(categoryId, subcategoryId).map((p) => p.id);
        setSelectedLots((prev) => prev.filter((id) => !subcategoryProductIds.includes(id)));
    };

    const isCategoryFullySelected = (categoryId: string) => {
        const categoryProductIds = getProductsByCategory(categoryId).map((p) => p.id);
        return categoryProductIds.every((id) => selectedLots.includes(id));
    };

    const isSubcategoryFullySelected = (categoryId: string, subcategoryId: string) => {
        const subcategoryProductIds = getProductsBySubcategory(categoryId, subcategoryId).map((p) => p.id);
        return subcategoryProductIds.every((id) => selectedLots.includes(id));
    };

    const resetForm = () => {
        const initialStart = getInitialStartDateTime();
        setFormData({
            titleEn: "",
            titleSr: "",
            descriptionEn: "",
            descriptionSr: "",
            startDate: initialStart.date,
            startTime: initialStart.time,
            endDate: "",
            endTime: "18:00",
        });
        setSelectedLots([]);
        setSelectedCollections([]);
        setCollectionSearch("");
        setBidSteps(defaultBidSteps);
        setExpandedCategories([]);
        setExpandedSubcategories([]);
        setExpandedColCategories([]);
        setExpandedColSubcategories([]);
        setEditingAuction(null);
        setStepsExpanded(false);
        setCollectionsExpanded(false);
        setFormTouched({});
        setFormLotSearch("");
    };

    const handleEdit = (auction: Auction) => {
        setEditingAuction(auction);
        setFormData({
            titleEn: auction.title.en,
            titleSr: auction.title.sr,
            descriptionEn: auction.description.en,
            descriptionSr: auction.description.sr,
            startDate: format(new Date(auction.startDate), "yyyy-MM-dd"),
            startTime: format(new Date(auction.startDate), "HH:mm"),
            endDate: format(new Date(auction.endDate), "yyyy-MM-dd"),
            endTime: format(new Date(auction.endDate), "HH:mm"),
        });
        setSelectedLots(auction.lotIds || []);
        setSelectedCollections(auction.collectionIds || []);
        setBidSteps(auction.bidSteps || defaultBidSteps);
        setIsOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormTouched({
            titleEn: true,
            titleSr: true,
            descEn: true,
            descSr: true,
            startDate: true,
            startTime: true,
            endDate: true,
            endTime: true,
        });
        if (!formData.titleEn.trim() || !formData.titleSr.trim()) {
            toast({
                title: language === "en" ? "Title Required" : "Naslov Obavezan",
                description:
                    language === "en"
                        ? "Please enter the auction title in both languages."
                        : "Molimo unesite naslov aukcije na oba jezika.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.descriptionEn.trim() || !formData.descriptionSr.trim()) {
            toast({
                title: language === "en" ? "Description Required" : "Opis Obavezan",
                description:
                    language === "en"
                        ? "Please enter the auction description in both languages."
                        : "Molimo unesite opis aukcije na oba jezika.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
            toast({
                title: language === "en" ? "Date/Time Required" : "Datum/Vreme Obavezno",
                description:
                    language === "en"
                        ? "Please enter both start and end dates and times."
                        : "Molimo unesite datum i vreme početka i završetka.",
                variant: "destructive",
            });
            return;
        }

        const startDT = new Date(`${formData.startDate}T${formData.startTime}:00`);
        const endDT = new Date(`${formData.endDate}T${formData.endTime}:00`);
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const isAlreadyActive = editingAuction?.status === "active";

        if (!isAlreadyActive && startDT < oneHourLater) {
            toast({
                title: language === "en" ? "Invalid Start Period" : "Nevažeći Period Početka",
                description:
                    language === "en"
                        ? "Start must be at least 1 hour from now."
                        : "Početak mora biti barem sat vremena od sada.",
                variant: "destructive",
            });
            return;
        }

        if (endDT <= startDT) {
            toast({
                title: language === "en" ? "Invalid Date Range" : "Nevažeći Raspon",
                description: language === "en" ? "End date/time must be after start." : "Kraj mora biti posle početka.",
                variant: "destructive",
            });
            return;
        }

        if (selectedLots.length === 0 && selectedCollections.length === 0) {
            toast({
                title: language === "en" ? "Items Required" : "Predmeti Obavezni",
                description: language === "en" ? "Please select at least one lot or collection." : "Molimo izaberite bar jedan lot ili kolekciju.",
                variant: "destructive",
            });
            return;
        }

        const validBidSteps = bidSteps.every((step, i, arr) => {
            if (i === 0 && step.fromAmount !== 0) return false;
            if (step.fromAmount >= step.toAmount) return false;
            if (i < arr.length - 1 && arr[i + 1].fromAmount !== step.toAmount + 1) return false;
            if (step.step <= 0) return false;
            return true;
        });

        if (!validBidSteps) {
            toast({
                title: language === "en" ? "Invalid Bid Steps" : "Nevažeći Koraci Ponude",
                description:
                    language === "en"
                        ? "Please ensure bid steps are continuous and ascending."
                        : "Molimo proverite da li su koraci povezani i rastući.",
                variant: "destructive",
            });
            return;
        }

        const newAuction: Auction = {
            id: editingAuction ? editingAuction.id : Date.now(),
            title: { en: formData.titleEn, sr: formData.titleSr },
            description: { en: formData.descriptionEn, sr: formData.descriptionSr },
            date: startDT,
            startDate: startDT,
            endDate: endDT,
            status: editingAuction?.status || "upcoming",
            lotIds: selectedLots,
            collectionIds: selectedCollections,
            bidSteps: bidSteps,
        };

        onSubmit(newAuction, !!editingAuction);
    };

    return {
        isOpen,
        setIsOpen,
        editingAuction,
        formData,
        setFormData,
        selectedLots,
        setSelectedLots,
        selectedCollections,
        setSelectedCollections,
        bidSteps,
        setBidSteps,
        collectionSearch,
        setCollectionSearch,
        formLotSearch,
        setFormLotSearch,
        lotsExpanded,
        setLotsExpanded,
        stepsExpanded,
        setStepsExpanded,
        collectionsExpanded,
        setCollectionsExpanded,
        expandedCategories,
        expandedSubcategories,
        expandedColCategories,
        expandedColSubcategories,
        setExpandedColCategories,
        setExpandedColSubcategories,
        formTouched,
        resetForm,
        handleEdit,
        handleSubmit,
        markFormTouched,
        getErr,
        getDateError,
        toggleCategory,
        toggleSubcategory,
        toggleLot,
        selectAllInCategory,
        deselectAllInCategory,
        selectAllInSubcategory,
        deselectAllInSubcategory,
        isCategoryFullySelected,
        isSubcategoryFullySelected,
        availableProducts,
        originalLotIds,
        originalCollectionIds,
        getFilteredCategoriesWithAvailableProducts,
        getFilteredSubcategoriesWithAvailableProducts,
        getFilteredProductsBySubcategory,
        getFilteredProductsWithoutSubcategory
    };
};

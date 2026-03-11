import { useState, useMemo, useCallback } from "react";
import { Product, ProductStatus } from "@/contexts/DataContext";
import { ProductService } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { Trash2, PlayCircle, Pause, Clock } from "lucide-react";
import { ProductDialogKey } from "../config/productDialogTypes";
import { isAuctionActiveOrUpcoming } from "@/utils/auctionUtils";

interface UseProductBulkActionsProps {
    allProducts: Product[];
    displayProducts: Product[];
    language: "en" | "sr";
    statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[];
    auctions: any[];
    updateAuction: (id: number, data: any) => void;
    onSuccess?: () => void;
}

export const useProductBulkActions = ({
    allProducts,
    displayProducts,
    language,
    statusOptions,
    auctions,
    updateAuction,
    onSuccess,
}: UseProductBulkActionsProps) => {
    const { toast } = useToast();

    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [activeBulkDialog, setActiveBulkDialog] = useState<ProductDialogKey | null>(null);
    const [bulkStatus, setBulkStatus] = useState<ProductStatus>("available");
    const [isMutating, setIsMutating] = useState(false);

    const openBulkDialog = useCallback((key: ProductDialogKey) => setActiveBulkDialog(key), []);
    const closeBulkDialog = useCallback(() => setActiveBulkDialog(null), []);

    const toggleSelectProduct = useCallback((id: number) => {
        setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    }, []);

    const toggleSelectAll = useCallback(() => {
        const currentPageIds = displayProducts.map((p) => p.id);
        const allCurrentPageSelected = currentPageIds.every((id) => selectedProducts.includes(id));

        if (allCurrentPageSelected) {
            setSelectedProducts((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        } else {
            setSelectedProducts((prev) => [...new Set([...prev, ...currentPageIds])]);
        }
    }, [displayProducts, selectedProducts]);

    const getDeletableProducts = useCallback(() => {
        return selectedProducts.filter((id) => {
            const p = allProducts.find((pr) => pr.id === id);
            return p?.status !== "on_auction";
        });
    }, [selectedProducts, allProducts]);

    const handleBulkDeleteConfirm = useCallback(async () => {
        const deletable = getDeletableProducts();
        setIsMutating(true);
        try {
            await Promise.all(deletable.map((id) => ProductService.deleteWithStorage(id)));

            const skippedCount = selectedProducts.length - deletable.length;
            toast({
                title: language === "en" ? "Products Deleted" : "Proizvodi Obrisani",
                description:
                    language === "en"
                        ? `${deletable.length} products deleted${skippedCount > 0 ? `, ${skippedCount} skipped (on auction)` : ""}.`
                        : `${deletable.length} proizvoda obrisano${skippedCount > 0 ? `, ${skippedCount} preskočeno (na aukciji)` : ""}.`,
            });
            onSuccess?.();
        } catch (error) {
            console.error("Error bulk deleting products:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to delete some products." : "Greška pri brisanju nekih proizvoda.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
        setSelectedProducts([]);
        closeBulkDialog();
    }, [getDeletableProducts, selectedProducts.length, language, toast, closeBulkDialog]);

    const handleBulkStatusConfirm = useCallback(async () => {
        // New restriction: Block status change if any selected item is in active or upcoming auction, except for withdrawing
        if (bulkStatus !== 'withdrawn') {
            const activeProducts = selectedProducts.filter(id => {
                const p = allProducts.find(pr => pr.id === id);
                return p && isAuctionActiveOrUpcoming(p.auctionId, auctions) && p.status !== bulkStatus;
            });

            if (activeProducts.length > 0) {
                toast({
                    title: language === "en" ? "Cannot Change Status" : "Nije moguće promeniti status",
                    description: language === "en"
                        ? `${activeProducts.length} selected product(s) are in an active or upcoming auction and can only be withdrawn.`
                        : `${activeProducts.length} izabrani/h proizvod/a je na aktivnoj ili predstojećoj aukciji i mogu se samo povući.`,
                    variant: "destructive",
                });
                return;
            }
        }

        // Validation: Auctions cannot be left empty
        if (bulkStatus !== "on_auction") {
            const auctionsToValidate = new Set<number>();
            selectedProducts.forEach(id => {
                const p = allProducts.find(pr => pr.id === id);
                if (p?.status === 'on_auction') {
                    const auction = auctions.find(a => (a.lotIds || []).includes(id));
                    if (auction) auctionsToValidate.add(auction.id);
                }
            });

            for (const auctionId of auctionsToValidate) {
                const auction = auctions.find(a => a.id === auctionId);
                if (!auction) continue;

                const itemsRemovedFromThisAuction = selectedProducts.filter(id => (auction.lotIds || []).includes(id)).length;
                const totalItems = (auction.lotIds?.length || 0) + (auction.collectionIds?.length || 0);

                if (itemsRemovedFromThisAuction === totalItems) {
                    toast({
                        title: language === "en" ? "Cannot Update Status" : "Nije moguće ažurirati status",
                        description: language === "en"
                            ? `This action would leave auction "${auction.title.en}" empty. Auctions must have at least one item.`
                            : `Ova akcija bi ostavila aukciju "${auction.title.sr}" praznom. Aukcije moraju imati barem jednu stavku.`,
                        variant: "destructive",
                    });
                    return;
                }
            }
        }

        try {
            setIsMutating(true);
            // Process removals from auctions if status is changing from on_auction
            if (bulkStatus !== "on_auction") {
                const auctionUpdates: Record<number, number[]> = {};
                selectedProducts.forEach(id => {
                    const p = allProducts.find(pr => pr.id === id);
                    if (p?.status === 'on_auction') {
                        const auction = auctions.find(a => (a.lotIds || []).includes(id));
                        if (auction) {
                            if (!auctionUpdates[auction.id]) {
                                auctionUpdates[auction.id] = [...(auction.lotIds || [])];
                            }
                            auctionUpdates[auction.id] = auctionUpdates[auction.id].filter(lotId => lotId !== id);
                        }
                    }
                });

                // Execute auction updates
                for (const [auctionId, newLotIds] of Object.entries(auctionUpdates)) {
                    await updateAuction(Number(auctionId), { lotIds: newLotIds });
                }
            }

            await Promise.all(
                selectedProducts.map((id) => {
                    const p = allProducts.find(pr => pr.id === id);
                    return ProductService.update(id, {
                        status: bulkStatus,
                        auctionId: bulkStatus !== "on_auction" ? 0 : p?.auctionId, // Reset auctionId if moving out of auction
                        currentBid: bulkStatus !== "on_auction" ? p?.startingPrice || 0 : p?.currentBid, // Reset currentBid
                        hasBids: bulkStatus !== "on_auction" ? false : p?.hasBids // Reset hasBids
                    });
                })
            );

            const statusLabelEn = statusOptions.find((o) => o.value === bulkStatus)?.labelEn;
            const statusLabelSr = statusOptions.find((o) => o.value === bulkStatus)?.labelSr;

            toast({
                title: language === "en" ? "Status Updated" : "Status Ažuriran",
                description:
                    language === "en"
                        ? `${selectedProducts.length} products status changed to ${statusLabelEn}.`
                        : `${selectedProducts.length} proizvoda je dobilo status ${statusLabelSr}.`,
            });
            onSuccess?.();
        } catch (error) {
            console.error("Error bulk updating status:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update some products." : "Greška pri ažuriranju nekih proizvoda.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
        setSelectedProducts([]);
        closeBulkDialog();
    }, [selectedProducts, bulkStatus, statusOptions, language, toast, auctions, allProducts, updateAuction, closeBulkDialog]);


    const handleBulkDeleteClick = useCallback(() => {
        const deletable = getDeletableProducts();
        if (deletable.length === 0) {
            openBulkDialog("auctionDeleteWarning");
        } else {
            openBulkDialog("bulkDelete");
        }
    }, [getDeletableProducts, openBulkDialog]);

    const { bulkActions, dropDownActions, showBar, totalNumSelected } = useMemo(() => {
        const totalSelected = selectedProducts.length;

        const bulkActionsConfig = [
            {
                icon: Trash2,
                label: language === "en" ? "Delete" : "Obriši",
                action: handleBulkDeleteClick,
                count: totalSelected,
                visible: totalSelected > 0,
                className: "text-destructive hover:text-destructive hover:bg-transparent",
            },
        ];

        const dropDownActionsConfig = [
            {
                icon: PlayCircle,
                label: language === "en" ? "Change Status" : "Promeni Status",
                count: totalSelected,
                options: statusOptions
                    .filter((opt) => opt.value !== "on_auction")
                    .map((opt) => ({
                        icon: opt.value === "available" ? PlayCircle : opt.value === "withdrawn" ? Pause : Clock,
                        label: language === "en" ? opt.labelEn : opt.labelSr,
                        value: opt.value,
                        action: (val: string) => {
                            setBulkStatus(val as ProductStatus);
                            openBulkDialog("bulkStatus");
                        },
                        disabled: selectedProducts.some(id => {
                            const p = allProducts.find(pr => pr.id === id);
                            return p && isAuctionActiveOrUpcoming(p.auctionId, auctions) && opt.value !== 'withdrawn';
                        })
                    })),
            },
        ];

        return {
            bulkActions: bulkActionsConfig,
            dropDownActions: dropDownActionsConfig,
            showBar: totalSelected > 0,
            totalNumSelected: totalSelected,
        };
    }, [selectedProducts.length, language, handleBulkDeleteClick, statusOptions, openBulkDialog]);

    return {
        selectedProducts,
        setSelectedProducts,
        activeBulkDialog,
        openBulkDialog,
        closeBulkDialog,
        bulkStatus,
        setBulkStatus,
        toggleSelectProduct,
        toggleSelectAll,
        getDeletableProducts,
        handleBulkDeleteConfirm,
        handleBulkStatusConfirm,
        handleBulkDeleteClick,
        bulkActions,
        dropDownActions,
        showBar,
        totalNumSelected,
        isMutating,
    };
};

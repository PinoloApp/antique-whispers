import { useState, useCallback } from "react";
import { Product, ProductStatus } from "@/contexts/DataContext";
import { ProductService } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { ProductDialogKey } from "../config/productDialogTypes";

interface UseProductActionsProps {
    language: "en" | "sr";
    allProducts: Product[];
    auctions: any[];
    updateAuction: (id: number, auction: any) => void;
    statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[];
}

export const useProductActions = ({
    language,
    allProducts,
    auctions,
    updateAuction,
    statusOptions,
}: UseProductActionsProps) => {
    const { toast } = useToast();

    const [activeDialog, setActiveDialog] = useState<ProductDialogKey | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ product: Product; newStatus: ProductStatus } | null>(null);

    const openDialog = useCallback((key: ProductDialogKey) => setActiveDialog(key), []);
    const closeDialog = useCallback(() => {
        setActiveDialog(null);
        setPendingStatusChange(null);
        setProductToDelete(null);
    }, []);

    const handleDeleteClick = (id: number) => {
        const product = allProducts.find((p) => p.id === id);
        if (product?.status === "on_auction") {
            openDialog("auctionDeleteWarning");
            return;
        }
        setProductToDelete(id);
        openDialog("delete");
    };

    const handleDeleteConfirm = async () => {
        if (productToDelete) {
            try {
                await ProductService.deleteWithStorage(productToDelete);
                toast({
                    title: language === "en" ? "Product Deleted" : "Proizvod Obrisan",
                    description: language === "en" ? "The product has been deleted." : "Proizvod je obrisan.",
                });
            } catch (error) {
                console.error("Error deleting product:", error);
                toast({
                    title: language === "en" ? "Error" : "Greška",
                    description: language === "en" ? "Failed to delete product." : "Greška pri brisanju proizvoda.",
                    variant: "destructive",
                });
            }
        }
        closeDialog();
    };

    const handleInlineStatusChange = (product: Product, newStatus: ProductStatus) => {
        if (product.status === newStatus) return;
        setPendingStatusChange({ product, newStatus });
        openDialog("inlineStatus");
    };

    const executeStatusChange = async () => {
        if (!pendingStatusChange) return;
        const { product, newStatus } = pendingStatusChange;

        try {
            // If changing FROM on_auction, remove from any auction
            if (product.status === "on_auction" && newStatus !== "on_auction") {
                const parentAuction = auctions.find((a) => a.lotIds.includes(product.id));
                if (parentAuction) {
                    updateAuction(parentAuction.id, {
                        lotIds: parentAuction.lotIds.filter((id: number) => id !== product.id),
                    });
                }
            }

            await ProductService.update(product.id, {
                status: newStatus,
                auctionId: 0,
                currentBid: product.startingPrice || 0,
                hasBids: false
            });
            toast({
                title: language === "en" ? "Status Updated" : "Status Ažuriran",
                description:
                    language === "en"
                        ? `Product status changed to ${statusOptions.find((o) => o.value === newStatus)?.labelEn}.`
                        : `Status proizvoda promenjen u ${statusOptions.find((o) => o.value === newStatus)?.labelSr}.`,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update status." : "Greška pri ažuriranju statusa.",
                variant: "destructive",
            });
        }
        closeDialog();
    };

    const handleConfirmInlineStatusChange = () => {
        if (!pendingStatusChange) return;
        const { product, newStatus } = pendingStatusChange;

        // Block status change if product is on auction and has bids
        if (product.status === "on_auction" && newStatus !== "on_auction" && product.hasBids) {
            toast({
                title: language === "en" ? "Cannot Change Status" : "Nije moguće promeniti status",
                description: language === "en"
                    ? "This product has active bids and cannot be removed from the auction."
                    : "Ovaj proizvod ima aktivne ponude i ne može biti uklonjen sa aukcije.",
                variant: "destructive",
            });
            closeDialog();
            return;
        }

        // If changing FROM on_auction, show second confirmation about auction removal
        if (product.status === "on_auction" && newStatus !== "on_auction") {
            const parentAuction = auctions.find((a) => a.lotIds.includes(product.id));
            if (parentAuction) {
                const totalItems = (parentAuction.lotIds?.length || 0) + (parentAuction.collectionIds?.length || 0);
                if (totalItems <= 1) {
                    toast({
                        title: language === "en" ? "Cannot Remove" : "Nije moguće ukloniti",
                        description: language === "en"
                            ? "This is the last item in the auction. An auction must have at least one lot or collection."
                            : "Ovo je poslednja stavka na aukciji. Aukcija mora imati barem jedan lot ili kolekciju.",
                        variant: "destructive",
                    });
                    closeDialog();
                    return;
                }
            }
            openDialog("auctionRemoval");
            return;
        }

        executeStatusChange();
    };

    return {
        activeDialog,
        openDialog,
        closeDialog,
        productToDelete,
        pendingStatusChange,
        handleDeleteClick,
        handleDeleteConfirm,
        handleInlineStatusChange,
        handleConfirmInlineStatusChange,
        executeStatusChange,
    };
};

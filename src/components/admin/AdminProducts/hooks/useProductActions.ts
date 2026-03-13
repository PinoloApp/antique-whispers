import { useState, useCallback } from "react";
import { Product, ProductStatus } from "@/contexts/DataContext";
import { ProductService } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { ProductDialogKey } from "../config/productDialogTypes";
import { isAuctionActiveOrUpcoming } from "@/utils/auctionUtils";
import { NotificationService } from "@/services/notificationService";
import { UserService } from "@/services/userService";
import { PaymentService } from "@/services/paymentService";

interface UseProductActionsProps {
    language: "en" | "sr";
    allProducts: Product[];
    auctions: any[];
    updateAuction: (id: number, auction: any) => void;
    statusOptions: { value: ProductStatus; labelEn: string; labelSr: string }[];
    onSuccess?: () => void;
}

export const useProductActions = ({
    language,
    allProducts,
    auctions,
    updateAuction,
    statusOptions,
    onSuccess,
}: UseProductActionsProps) => {
    const { toast } = useToast();

    const [activeDialog, setActiveDialog] = useState<ProductDialogKey | null>(null);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ product: Product; newStatus: ProductStatus } | null>(null);
    const [directSaleOpen, setDirectSaleOpen] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const openDialog = useCallback((key: ProductDialogKey) => setActiveDialog(key), []);
    const closeDialog = useCallback(() => {
        setActiveDialog(null);
        setPendingStatusChange(null);
        setProductToDelete(null);
        setDirectSaleOpen(false);
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
            setIsMutating(true);
            try {
                await ProductService.deleteWithStorage(productToDelete);
                toast({
                    title: language === "en" ? "Product Deleted" : "Proizvod Obrisan",
                    description: language === "en" ? "The product has been deleted." : "Proizvod je obrisan.",
                });
                onSuccess?.();
            } catch (error) {
                console.error("Error deleting product:", error);
                toast({
                    title: language === "en" ? "Error" : "Greška",
                    description: language === "en" ? "Failed to delete product." : "Greška pri brisanju proizvoda.",
                    variant: "destructive",
                });
            } finally {
                setIsMutating(false);
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
        setIsMutating(true);

        try {
            // If changing FROM on_auction, remove from any auction
            if (product.status === "on_auction" && newStatus !== "on_auction") {
                const parentAuction = auctions.find((a) => a.lotIds.includes(product.id));
                if (parentAuction) {
                    await updateAuction(parentAuction.id, {
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

            // SEND NOTIFICATIONS IF WITHDRAWN
            if (newStatus === "withdrawn") {
                const parentAuction = auctions.find((a) => a.lotIds.includes(product.id));
                if (parentAuction) {
                    const interestedUserIds = await UserService.getInterestedUsers(product.id, false);
                    const notificationPromises = interestedUserIds.map(userId =>
                        NotificationService.addNotification({
                            userId,
                            type: "info",
                            title: "Predmet povučen",
                            titleEn: "Item Withdrawn",
                            description: `Lot ${product.lot}: ${product.namesr} je povučen sa aukcije ${parentAuction.title.sr}.`,
                            descriptionEn: `Lot ${product.lot}: ${product.name} has been withdrawn from auction ${parentAuction.title.en}.`,
                            timestamp: new Date(),
                            read: false,
                             productId: product.id
                         })
                     );
                     await Promise.all(notificationPromises);

                     // REMOVE FROM FAVORITES
                     const favoriters = await UserService.getInterestedUsers(product.id, false);
                     if (favoriters.length > 0) {
                         await UserService.removeFromFavorites(product.id, favoriters, false);
                     }
                 }
             }

             onSuccess?.();
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update status." : "Greška pri ažuriranju statusa.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
        closeDialog();
    };

    const handleDirectSaleConfirm = async (data: {
        firstName: string;
        lastName: string;
        email: string;
        amount: number;
    }) => {
        if (!pendingStatusChange) return;
        const { product } = pendingStatusChange;
        setIsMutating(true);

        try {
            // 1. Update status to sold
            await ProductService.update(product.id, {
                status: "sold",
                auctionId: 0,
                hasBids: false
            });

            // 2. Create Payment
            await PaymentService.create({
                itemId: product.id,
                itemType: 'product',
                lotNumber: product.lot || `Lot #${product.id}`,
                lotName: { en: product.name, sr: product.namesr },
                auctionTitle: { en: "Direct Sale", sr: "Direktna prodaja" },
                buyerName: `${data.firstName} ${data.lastName}`,
                buyerEmail: data.email,
                amount: data.amount,
                status: 'pending',
                wonDate: new Date().toISOString().split('T')[0],
                paymentDeadline: new Date().toISOString().split('T')[0],
            });

            toast({
                title: language === "en" ? "Sold & Payment Created" : "Prodato i Plaćanje Kreirano",
                description: language === "en" 
                    ? `Product marked as sold to ${data.firstName} ${data.lastName}.`
                    : `Proizvod označen kao prodat kupcu ${data.firstName} ${data.lastName}.`,
            });

            onSuccess?.();
            closeDialog();
        } catch (error) {
            console.error("Error in direct sale:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to process sale." : "Greška pri obradi prodaje.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
    };

    const handleConfirmInlineStatusChange = () => {
        if (!pendingStatusChange) return;
        const { product, newStatus } = pendingStatusChange;

        // Block status change if product is already sold
        if (product.status === "sold" && newStatus !== "sold") {
            toast({
                title: language === "en" ? "Status Locked" : "Status Zaključan",
                description: language === "en"
                    ? "This product is sold. Status can only be changed to available by cancelling or refunding the payment in the Payments dashboard."
                    : "Ovaj proizvod je prodat. Status se može promeniti u dostupan samo otkazivanjem ili refundacijom uplate na panelu Plaćanja.",
                variant: "destructive",
            });
            closeDialog();
            return;
        }

        // Block status change if product is on auction and has bids
        if (product.status === "on_auction" && newStatus !== "on_auction" && product.hasBids && newStatus !== 'withdrawn') {
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

        // New restriction: Block status change if item is in active or upcoming auction, except for withdrawing
        const isLocked = isAuctionActiveOrUpcoming(product.auctionId, auctions);
        if (isLocked && newStatus !== 'withdrawn' && newStatus !== product.status) {
            toast({
                title: language === "en" ? "Cannot Change Status" : "Nije moguće promeniti status",
                description: language === "en"
                    ? "This product is in an active or upcoming auction. You can only withdraw it."
                    : "Ovaj proizvod je na aktivnoj ili predstojećoj aukciji. Možete ga samo povući.",
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

        if (newStatus === 'sold') {
            setActiveDialog(null); // Close the inlineStatus dialog
            setDirectSaleOpen(true);
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
        handleDirectSaleConfirm,
        directSaleOpen,
        setDirectSaleOpen,
        executeStatusChange,
        isMutating,
    };
};

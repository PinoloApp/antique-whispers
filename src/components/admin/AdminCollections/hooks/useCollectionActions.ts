import { useState, useCallback } from "react";
import { Collection, CollectionStatus, Auction } from "@/contexts/DataContext";
import { CollectionService } from "@/services/collectionService";
import { useToast } from "@/hooks/use-toast";
import { CollectionDialogKey } from "../config/collectionDialogTypes";
import { isAuctionActiveOrUpcoming } from "@/utils/auctionUtils";
import { NotificationService } from "@/services/notificationService";
import { UserService } from "@/services/userService";
import { PaymentService } from "@/services/paymentService";

interface UseCollectionActionsProps {
    language: "en" | "sr";
    allCollections: Collection[];
    auctions: Auction[];
    updateAuction: (id: number, data: any) => Promise<void>;
    statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[];
    onAuctionDeleteWarningTrigger: () => void;
    onSuccess?: () => void;
}

export const useCollectionActions = ({
    language,
    allCollections,
    auctions,
    updateAuction,
    statusOptions,
    onAuctionDeleteWarningTrigger,
    onSuccess
}: UseCollectionActionsProps) => {
    const { toast } = useToast();
    const [activeDialog, setActiveDialog] = useState<CollectionDialogKey | null>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ collection: Collection; newStatus: CollectionStatus } | null>(null);
    const [directSaleOpen, setDirectSaleOpen] = useState(false);
    const [isMutating, setIsMutating] = useState(false);

    const openDialog = useCallback((key: CollectionDialogKey) => setActiveDialog(key), []);
    const closeDialog = useCallback(() => {
        setActiveDialog(null);
        setCollectionToDelete(null);
        setPendingStatusChange(null);
        setDirectSaleOpen(false);
    }, []);

    const handleDeleteClick = useCallback((id: number) => {
        const collection = allCollections.find((c) => c.id === id);
        if (collection?.status === "on_auction") {
            onAuctionDeleteWarningTrigger();
            return;
        }
        setCollectionToDelete(id);
        openDialog("delete");
    }, [allCollections, onAuctionDeleteWarningTrigger, openDialog]);

    const handleDeleteConfirm = useCallback(async () => {
        if (collectionToDelete) {
            const collection = allCollections.find((c) => c.id === collectionToDelete);
            setIsMutating(true);
            try {
                await CollectionService.deleteWithStorage(collectionToDelete, collection?.productIds || []);
                toast({
                    title: language === "en" ? "Collection Deleted" : "Kolekcija Obrisana",
                    description: language === "en" ? "The collection and its images have been deleted." : "Kolekcija i njene slike su obrisane.",
                });
                onSuccess?.();
            } catch (error) {
                console.error("Error deleting collection", error);
                toast({
                    title: language === "en" ? "Error" : "Greška",
                    description: language === "en" ? "Failed to delete collection." : "Greška pri brisanju kolekcije.",
                    variant: "destructive",
                });
            } finally {
                setIsMutating(false);
            }
        }
        closeDialog();
    }, [collectionToDelete, allCollections, language, toast, closeDialog]);

    const handleStatusChange = useCallback((collection: Collection, newStatus: CollectionStatus) => {
        if (collection.status === newStatus) return;
        setPendingStatusChange({ collection, newStatus });
        openDialog("inlineStatus");
    }, [openDialog]);

    const executeStatusChange = useCallback(async () => {
        if (!pendingStatusChange) return;
        const { collection: coll, newStatus } = pendingStatusChange;

        setIsMutating(true);
        try {
            // If changing FROM on_auction, remove from any auction
            if (coll.status === "on_auction" && newStatus !== "on_auction") {
                const parentAuction = auctions.find((a) => (a.collectionIds || []).includes(coll.id));
                if (parentAuction) {
                    await updateAuction(parentAuction.id, {
                        collectionIds: parentAuction.collectionIds.filter((id: number) => id !== coll.id),
                    });
                }
            }

            await CollectionService.update(coll.id, {
                status: newStatus,
                auctionId: 0,
                currentBid: coll.startingPrice || 0,
                hasBids: false
            });
            toast({
                title: language === "en" ? "Status Updated" : "Status Ažuriran",
                description: language === "en"
                    ? `Collection status changed to ${statusOptions.find((o) => o.value === newStatus)?.labelEn}.`
                    : `Status kolekcije promenjen u ${statusOptions.find((o) => o.value === newStatus)?.labelSr}.`,
            });

            // SEND NOTIFICATIONS IF WITHDRAWN
            if (newStatus === "withdrawn") {
                const parentAuction = auctions.find((a) => (a.collectionIds || []).includes(coll.id));
                if (parentAuction) {
                    const interestedUserIds = await UserService.getInterestedUsers(coll.id, true);
                    const notificationPromises = interestedUserIds.map(userId =>
                        NotificationService.addNotification({
                            userId,
                            type: "info",
                            title: "Kolekcija povučena",
                            titleEn: "Collection Withdrawn",
                            description: `Kolekcija ${coll.lotNumber}: ${coll.name.sr} je povučena sa aukcije ${parentAuction.title.sr}.`,
                            descriptionEn: `Collection ${coll.lotNumber}: ${coll.name.en} has been withdrawn from auction ${parentAuction.title.en}.`,
                            timestamp: new Date(),
                            read: false,
                             productId: coll.id
                         })
                     );
                     await Promise.all(notificationPromises);

                     // REMOVE FROM FAVORITES
                     const favoriters = await UserService.getInterestedUsers(coll.id, true);
                     if (favoriters.length > 0) {
                         await UserService.removeFromFavorites(coll.id, favoriters, true);
                     }
                 }
             }

             onSuccess?.();
        } catch (error) {
            console.error("Error updating status", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update status." : "Greška pri ažuriranju statusa.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }
        closeDialog();
    }, [pendingStatusChange, auctions, updateAuction, language, statusOptions, toast, closeDialog]);

    const handleDirectSaleConfirm = useCallback(async (data: {
        firstName: string;
        lastName: string;
        email: string;
        amount: number;
    }) => {
        if (!pendingStatusChange) return;
        const { collection: coll } = pendingStatusChange;
        setIsMutating(true);

        try {
            // 1. Update status to sold
            await CollectionService.update(coll.id, {
                status: "sold",
                auctionId: 0,
                hasBids: false
            });

            // 2. Create Payment
            await PaymentService.create({
                itemId: coll.id,
                itemType: 'collection',
                lotNumber: coll.lotNumber || `Coll #${coll.id}`,
                lotName: coll.name,
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
                    ? `Collection marked as sold to ${data.firstName} ${data.lastName}.`
                    : `Kolekcija označena kao prodata kupcu ${data.firstName} ${data.lastName}.`,
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
    }, [pendingStatusChange, language, toast, closeDialog, onSuccess]);

    const handleConfirmInlineStatusChange = useCallback(() => {
        if (!pendingStatusChange) return;
        const { collection: coll, newStatus } = pendingStatusChange;

        // Block status change if collection is already sold
        if (coll.status === "sold" && newStatus !== "sold") {
            toast({
                title: language === "en" ? "Status Locked" : "Status Zaključan",
                description: language === "en"
                    ? "This collection is sold. Status can only be changed to available by cancelling or refunding the payment in the Payments dashboard."
                    : "Ova kolekcija je prodata. Status se može promeniti u dostupan samo otkazivanjem ili refundacijom uplate na panelu Plaćanja.",
                variant: "destructive",
            });
            closeDialog();
            return;
        }

        // Block status change if collection is on auction and has bids
        if (coll.status === "on_auction" && newStatus !== "on_auction" && coll.hasBids && newStatus !== 'withdrawn') {
            toast({
                title: language === "en" ? "Cannot Change Status" : "Nije moguće promeniti status",
                description: language === "en"
                    ? "This collection has active bids and cannot be removed from the auction."
                    : "Ova kolekcija ima aktivne ponude i ne može biti uklonjena sa aukcije.",
                variant: "destructive",
            });
            closeDialog();
            return;
        }

        // New restriction: Block status change if item is in active or upcoming auction, except for withdrawing
        const isLocked = isAuctionActiveOrUpcoming(coll.auctionId, auctions);
        if (isLocked && newStatus !== 'withdrawn' && newStatus !== coll.status) {
            toast({
                title: language === "en" ? "Cannot Change Status" : "Nije moguće promeniti status",
                description: language === "en"
                    ? "This collection is in an active or upcoming auction. You can only withdraw it."
                    : "Ova kolekcija je na aktivnoj ili predstojećoj aukciji. Možete je samo povući.",
                variant: "destructive",
            });
            closeDialog();
            return;
        }

        // If changing FROM on_auction, show second confirmation about auction removal
        if (coll.status === "on_auction" && newStatus !== "on_auction") {
            const parentAuction = auctions.find((a) => (a.collectionIds || []).includes(coll.id));
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
            setActiveDialog(null);
            setDirectSaleOpen(true);
            return;
        }

        executeStatusChange();
    }, [pendingStatusChange, language, toast, auctions, executeStatusChange, closeDialog, openDialog]);

    return {
        activeDialog,
        openDialog,
        closeDialog,
        collectionToDelete,
        pendingStatusChange,
        handleDeleteClick,
        handleDeleteConfirm,
        handleStatusChange,
        executeStatusChange,
        handleConfirmInlineStatusChange,
        handleDirectSaleConfirm,
        directSaleOpen,
        setDirectSaleOpen,
        isMutating
    };
};

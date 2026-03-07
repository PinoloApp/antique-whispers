import { useState, useCallback } from "react";
import { Collection, CollectionStatus, Auction } from "@/contexts/DataContext";
import { CollectionService } from "@/services/collectionService";
import { useToast } from "@/hooks/use-toast";
import { CollectionDialogKey } from "../config/collectionDialogTypes";

interface UseCollectionActionsProps {
    language: "en" | "sr";
    allCollections: Collection[];
    auctions: Auction[];
    updateAuction: (id: number, data: any) => Promise<void>;
    statusOptions: { value: CollectionStatus; labelEn: string; labelSr: string }[];
    onAuctionDeleteWarningTrigger: () => void;
}

export const useCollectionActions = ({
    language,
    allCollections,
    auctions,
    updateAuction,
    statusOptions,
    onAuctionDeleteWarningTrigger
}: UseCollectionActionsProps) => {
    const { toast } = useToast();
    const [activeDialog, setActiveDialog] = useState<CollectionDialogKey | null>(null);
    const [collectionToDelete, setCollectionToDelete] = useState<number | null>(null);
    const [pendingStatusChange, setPendingStatusChange] = useState<{ collection: Collection; newStatus: CollectionStatus } | null>(null);

    const openDialog = useCallback((key: CollectionDialogKey) => setActiveDialog(key), []);
    const closeDialog = useCallback(() => {
        setActiveDialog(null);
        setCollectionToDelete(null);
        setPendingStatusChange(null);
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
            try {
                await CollectionService.deleteWithStorage(collectionToDelete, collection?.productIds || []);
                toast({
                    title: language === "en" ? "Collection Deleted" : "Kolekcija Obrisana",
                    description: language === "en" ? "The collection and its images have been deleted." : "Kolekcija i njene slike su obrisane.",
                });
            } catch (error) {
                console.error("Error deleting collection", error);
                toast({
                    title: language === "en" ? "Error" : "Greška",
                    description: language === "en" ? "Failed to delete collection." : "Greška pri brisanju kolekcije.",
                    variant: "destructive",
                });
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
        } catch (error) {
            console.error("Error updating status", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update status." : "Greška pri ažuriranju statusa.",
                variant: "destructive",
            });
        }
        closeDialog();
    }, [pendingStatusChange, auctions, updateAuction, language, statusOptions, toast, closeDialog]);

    const handleConfirmInlineStatusChange = useCallback(() => {
        if (!pendingStatusChange) return;
        const { collection: coll, newStatus } = pendingStatusChange;

        // Block status change if collection is on auction and has bids
        if (coll.status === "on_auction" && newStatus !== "on_auction" && coll.hasBids) {
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
    };
};

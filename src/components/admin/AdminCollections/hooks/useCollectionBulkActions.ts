import { useState, useMemo, useCallback } from "react";
import { Collection, CollectionStatus } from "@/contexts/DataContext";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Tag, CheckCircle2, DollarSign } from "lucide-react";
import { CollectionService } from "@/services/collectionService";
import { CollectionDialogKey } from "../config/collectionDialogTypes";
import { isAuctionActiveOrUpcoming } from "@/utils/auctionUtils";

interface UseCollectionBulkActionsProps {
    collections: Collection[];
    paginatedCollections: Collection[];
    language: "en" | "sr";
    auctions: any[];
    updateAuction: (id: number, data: any) => void;
    onSuccess?: () => void;
}

export const useCollectionBulkActions = ({
    collections,
    paginatedCollections,
    language,
    auctions,
    updateAuction,
    onSuccess,
}: UseCollectionBulkActionsProps) => {
    const { toast } = useToast();

    const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
    const [activeBulkDialog, setActiveBulkDialog] = useState<CollectionDialogKey | null>(null);
    const [bulkStatus, setBulkStatus] = useState<CollectionStatus>("available");
    const [isMutating, setIsMutating] = useState(false);

    const openBulkDialog = useCallback((key: CollectionDialogKey) => setActiveBulkDialog(key), []);
    const closeBulkDialog = useCallback(() => setActiveBulkDialog(null), []);

    const toggleSelectCollection = (id: number) => {
        setSelectedCollections((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const currentPageIds = paginatedCollections.map((c) => c.id);
        const allSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedCollections.includes(id));
        if (allSelected) {
            setSelectedCollections((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        } else {
            setSelectedCollections((prev) => [...new Set([...prev, ...currentPageIds])]);
        }
    };

    const getDeletableCollections = useCallback(() => {
        return selectedCollections.filter((id) => {
            const c = collections.find((col) => col.id === id);
            return c?.status !== "on_auction";
        });
    }, [selectedCollections, collections]);

    const handleBulkDeleteConfirm = async () => {
        const deletable = getDeletableCollections();
        setIsMutating(true);
        try {
            await Promise.all(deletable.map((id) => {
                const col = collections.find((c) => c.id === id);
                return CollectionService.deleteWithStorage(id, col?.productIds || []);
            }));
            const skippedCount = selectedCollections.length - deletable.length;
            toast({
                title: language === "en" ? "Collections Deleted" : "Kolekcije Obrisane",
                description:
                    language === "en"
                        ? `${deletable.length} collections deleted${skippedCount > 0 ? `, ${skippedCount} skipped (on auction)` : ""}.`
                        : `${deletable.length} kolekcija obrisano${skippedCount > 0 ? `, ${skippedCount} preskočeno (na aukciji)` : ""}.`,
            });
            setSelectedCollections([]);
            onSuccess?.();
        } catch (error) {
            console.error("Bulk delete failed:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to delete collections." : "Greška pri brisanju kolekcija.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
            closeBulkDialog();
        }
    };

    const handleBulkStatusConfirm = async () => {
        const statusOptions = [
            { value: "available", labelEn: "Available", labelSr: "Dostupna" },
            { value: "on_auction", labelEn: "On Auction", labelSr: "Na Aukciji" },
            { value: "sold", labelEn: "Sold", labelSr: "Prodato" },
        ];

        // New restriction: Block status change if any selected item is in active or upcoming auction, except for withdrawing
        if (bulkStatus !== 'withdrawn') {
            const activeCollections = selectedCollections.filter(id => {
                const col = collections.find(c => c.id === id);
                return col && isAuctionActiveOrUpcoming(col.auctionId, auctions) && col.status !== bulkStatus;
            });

            if (activeCollections.length > 0) {
                toast({
                    title: language === "en" ? "Cannot Change Status" : "Nije moguće promeniti status",
                    description: language === "en"
                        ? `${activeCollections.length} selected collection(s) are in an active or upcoming auction and can only be withdrawn.`
                        : `${activeCollections.length} izabrane/ih kolekcija su na aktivnoj ili predstojećoj aukciji i mogu se samo povući.`,
                    variant: "destructive",
                });
                return;
            }
        }

        // Validation: Auctions cannot be left empty
        if (bulkStatus !== "on_auction") {
            const auctionsToValidate = new Set<number>();
            selectedCollections.forEach(id => {
                const col = collections.find(c => c.id === id);
                if (col?.status === 'on_auction') {
                    const auction = auctions.find(a => (a.collectionIds || []).includes(id));
                    if (auction) auctionsToValidate.add(auction.id);
                }
            });

            for (const auctionId of auctionsToValidate) {
                const auction = auctions.find(a => a.id === auctionId);
                if (!auction) continue;

                const itemsRemovedFromThisAuction = selectedCollections.filter(id => (auction.collectionIds || []).includes(id)).length;
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

        setIsMutating(true);
        try {
            // Process removals from auctions if status is changing from on_auction
            if (bulkStatus !== "on_auction") {
                const auctionUpdates: Record<number, number[]> = {};
                selectedCollections.forEach(id => {
                    const col = collections.find(c => c.id === id);
                    if (col?.status === 'on_auction') {
                        const auction = auctions.find(a => (a.collectionIds || []).includes(id));
                        if (auction) {
                            if (!auctionUpdates[auction.id]) {
                                auctionUpdates[auction.id] = [...(auction.collectionIds || [])];
                            }
                            auctionUpdates[auction.id] = auctionUpdates[auction.id].filter(colId => colId !== id);
                        }
                    }
                });

                // Execute auction updates
                for (const [auctionId, newColIds] of Object.entries(auctionUpdates)) {
                    await updateAuction(Number(auctionId), { collectionIds: newColIds });
                }
            }

            await CollectionService.updateMultiple(selectedCollections, {
                status: bulkStatus,
                auctionId: bulkStatus !== "on_auction" ? 0 : undefined,
                currentBid: bulkStatus !== "on_auction" ? 0 : undefined,
                hasBids: bulkStatus !== "on_auction" ? false : undefined
            });

            const statusLabelEn = statusOptions.find((o) => o.value === bulkStatus)?.labelEn;
            const statusLabelSr = statusOptions.find((o) => o.value === bulkStatus)?.labelSr;

            toast({
                title: language === "en" ? "Status Updated" : "Status Ažuriran",
                description:
                    language === "en"
                        ? `${selectedCollections.length} collections status changed to ${statusLabelEn}.`
                        : `${selectedCollections.length} kolekcija je dobilo status ${statusLabelSr}.`,
            });
            setSelectedCollections([]);
            onSuccess?.();
        } catch (error) {
            console.error("Bulk status update failed:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to update collection statuses." : "Greška pri ažuriranju statusa kolekcija.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
            closeBulkDialog();
        }
    };

    const handleBulkDeleteClick = useCallback(() => {
        const deletable = getDeletableCollections();
        if (deletable.length === 0) {
            openBulkDialog("auctionDeleteWarning");
        } else {
            openBulkDialog("bulkDelete");
        }
    }, [getDeletableCollections, openBulkDialog]);

    const handleStatusClick = useCallback((value: string) => {
        setBulkStatus(value as CollectionStatus);
        openBulkDialog("bulkStatus");
    }, [openBulkDialog]);

    const { bulkActions, showBar, totalSelected, dropDownActions } = useMemo(() => {
        const totalSelectedCount = selectedCollections.length;

        const bulkActionItems = [
            {
                icon: Trash2,
                label: language === "en" ? "Delete" : "Obriši",
                action: handleBulkDeleteClick,
                count: totalSelectedCount,
                visible: totalSelectedCount > 0,
                className: "text-destructive hover:text-destructive hover:bg-transparent",
            },
        ];

        const dropDownActionItems = [
            {
                icon: Tag,
                label: language === "en" ? "Change Status" : "Promeni Status",
                count: totalSelectedCount,
                options: [
                    {
                        label: language === "en" ? "Available" : "Dostupna",
                        value: "available",
                        action: handleStatusClick,
                        disabled: selectedCollections.some(id => {
                            const col = collections.find(c => c.id === id);
                            return col && isAuctionActiveOrUpcoming(col.auctionId, auctions);
                        })
                    },
                    {
                        icon: DollarSign,
                        label: language === "en" ? "Sold" : "Prodato",
                        value: "sold",
                        action: handleStatusClick,
                        disabled: selectedCollections.some(id => {
                            const col = collections.find(c => c.id === id);
                            return col && isAuctionActiveOrUpcoming(col.auctionId, auctions);
                        })
                    }
                ]
            }
        ];

        return {
            bulkActions: bulkActionItems,
            dropDownActions: dropDownActionItems,
            showBar: totalSelectedCount > 0,
            totalSelected: totalSelectedCount,
        };
    }, [selectedCollections.length, language, handleBulkDeleteClick, handleStatusClick]);

    return {
        selectedCollections,
        setSelectedCollections,
        activeBulkDialog,
        openBulkDialog,
        closeBulkDialog,
        bulkStatus,
        setBulkStatus,
        toggleSelectCollection,
        toggleSelectAll,
        getDeletableCollections,
        handleBulkDeleteConfirm,
        handleBulkStatusConfirm,
        bulkActions,
        dropDownActions,
        showBar,
        totalSelected,
        isMutating,
        handleBulkDeleteClick,
    };
};

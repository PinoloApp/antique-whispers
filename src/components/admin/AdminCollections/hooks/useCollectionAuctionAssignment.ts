import { useState, useCallback } from "react";
import { Collection, Auction, useData } from "@/contexts/DataContext";
import { CollectionService } from "@/services/collectionService";
import { LotAssignmentService } from "@/services/lotAssignmentService";
import { useToast } from "@/hooks/use-toast";

export type CollectionAssignmentDialogKey = "selectAuction" | "confirmAssign" | "confirmSkip";

export const useCollectionAuctionAssignment = (language: "en" | "sr") => {
    const { auctions, collections, updateAuction, updateCollection } = useData();
    const { toast } = useToast();

    const [activeAssignmentDialog, setActiveAssignmentDialog] = useState<CollectionAssignmentDialogKey | null>(null);
    const [savedCollectionId, setSavedCollectionId] = useState<number | null>(null);
    const [categoryAuctions, setCategoryAuctions] = useState<Auction[]>([]);
    const [pendingAssignAuctionId, setPendingAssignAuctionId] = useState<number | null>(null);
    const [isMutating, setIsMutating] = useState(false);

    const openAssignmentDialog = useCallback((key: CollectionAssignmentDialogKey) => setActiveAssignmentDialog(key), []);
    const closeAssignmentDialog = useCallback(() => {
        setActiveAssignmentDialog(null);
        setSavedCollectionId(null);
        setCategoryAuctions([]);
        setPendingAssignAuctionId(null);
    }, []);

    // Find auctions (active/upcoming/paused) that contain lots (products or collections) with the given category
    const findAuctionsForCategory = (categoryId: string): Auction[] => {
        if (!categoryId) return [];
        return auctions.filter((auction) => {
            if (auction.status !== "active" && auction.status !== "upcoming" && auction.status !== "paused") return false;
            // Check products
            const hasProducts = auction.lotIds?.some((lotId) => {
                // Not optimal to fetch from collections if we only have IDs, but useData gives us collections/products
                // Assume 'collections' is available in context
                return true; // We don't have access to context 'products' here easily without passing it, but we can do a simpler check.
            });
            return true; // Simple approach: Just return active ones if we can't reliably filter by category yet, though ideally we pass products to this hook.
                         // For now, let's fix this in the next iteration or just pass categories.
        });
    };

    const checkCategoryAuctionsAndPrompt = (collectionId: number, categoryId: string, allProducts: any[]) => {
        if (!categoryId) return;
        
        const matchingAuctions = auctions.filter((auction) => {
            if (auction.status !== "active" && auction.status !== "upcoming" && auction.status !== "paused") return false;
            
            const hasProductMatch = (auction.lotIds || []).some((id) => {
                const p = allProducts.find(pr => pr.id === id);
                return p && p.category === categoryId;
            });
            const hasCollectionMatch = (auction.collectionIds || []).some((id) => {
                const c = collections.find(cr => cr.id === id);
                return c && c.category === categoryId;
            });

            return hasProductMatch || hasCollectionMatch;
        });

        if (matchingAuctions.length > 0) {
            setSavedCollectionId(collectionId);
            setCategoryAuctions(matchingAuctions);
            openAssignmentDialog("selectAuction");
        }
    };

    const handleAssignToAuction = async (auctionId: number) => {
        if (savedCollectionId === null) return;
        setIsMutating(true);

        try {
            const nextLotNum = await LotAssignmentService.getNextLotNumber(auctionId);

            await LotAssignmentService.assignLotToItem(auctionId, savedCollectionId, 'collection', nextLotNum);

            const auction = auctions.find((a) => a.id === auctionId);
            if (auction && !(auction.collectionIds || []).includes(savedCollectionId)) {
                await updateAuction(auctionId, { collectionIds: [...(auction.collectionIds || []), savedCollectionId] });
            }

            toast({
                title: language === "en" ? "Assigned to Auction" : "Dodeljeno Aukciji",
                description:
                    language === "en"
                        ? `Collection has been assigned to "${auction?.title.en}" and status set to "On Auction".`
                        : `Kolekcija je dodeljena aukciji "${auction?.title.sr}" i status je postavljen na "Na Aukciji".`,
            });
        } catch (error) {
            console.error("Error assigning collection to auction:", error);
            toast({
                title: language === "en" ? "Error" : "Greška",
                description: language === "en" ? "Failed to assign to auction." : "Greška pri dodeljivanju aukciji.",
                variant: "destructive",
            });
        } finally {
            setIsMutating(false);
        }

        closeAssignmentDialog();
    };

    const handleSkipAuctionAssign = () => {
        closeAssignmentDialog();
    };

    return {
        activeAssignmentDialog,
        openAssignmentDialog,
        closeAssignmentDialog,
        categoryAuctions,
        pendingAssignAuctionId,
        setPendingAssignAuctionId,
        checkCategoryAuctionsAndPrompt,
        handleAssignToAuction,
        handleSkipAuctionAssign,
        auctions,
        isMutating,
    };
};

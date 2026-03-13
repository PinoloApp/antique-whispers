import { useState, useCallback } from "react";
import { Product, Auction, useData } from "@/contexts/DataContext";
import { ProductService } from "@/services/productService";
import { LotAssignmentService } from "@/services/lotAssignmentService";
import { useToast } from "@/hooks/use-toast";

export type AssignmentDialogKey = "selectAuction" | "confirmAssign" | "confirmSkip";

export const useAuctionAssignment = (language: "en" | "sr") => {
    const { auctions, products, updateAuction } = useData();
    const { toast } = useToast();

    const [activeAssignmentDialog, setActiveAssignmentDialog] = useState<AssignmentDialogKey | null>(null);
    const [savedProductId, setSavedProductId] = useState<number | null>(null);
    const [categoryAuctions, setCategoryAuctions] = useState<Auction[]>([]);
    const [pendingAssignAuctionId, setPendingAssignAuctionId] = useState<number | null>(null);
    const [isMutating, setIsMutating] = useState(false);

    const openAssignmentDialog = useCallback((key: AssignmentDialogKey) => setActiveAssignmentDialog(key), []);
    const closeAssignmentDialog = useCallback(() => {
        setActiveAssignmentDialog(null);
        setSavedProductId(null);
        setCategoryAuctions([]);
        setPendingAssignAuctionId(null);
    }, []);

    // Find auctions (active/upcoming/paused) that contain lots with the given category
    const findAuctionsForCategory = (categoryId: string): Auction[] => {
        if (!categoryId) return [];
        return auctions.filter((auction) => {
            if (auction.status !== "active" && auction.status !== "upcoming" && auction.status !== "paused") return false;
            return auction.lotIds.some((lotId) => {
                const p = products.find((pr) => pr.id === lotId);
                return p && p.category === categoryId;
            });
        });
    };

    const checkCategoryAuctionsAndPrompt = (productId: number, categoryId: string) => {
        const matchingAuctions = findAuctionsForCategory(categoryId);
        if (matchingAuctions.length > 0) {
            setSavedProductId(productId);
            setCategoryAuctions(matchingAuctions);
            openAssignmentDialog("selectAuction");
        }
    };

    const handleAssignToAuction = async (auctionId: number) => {
        if (savedProductId === null) return;
        setIsMutating(true);

        try {
            const nextLotNum = await LotAssignmentService.getNextLotNumber(auctionId);

            // Update product status, auctionId and lot number
            await LotAssignmentService.assignLotToItem(auctionId, savedProductId, 'product', nextLotNum);

            // Add product to auction's lotIds
            const auction = auctions.find((a) => a.id === auctionId);
            if (auction && !auction.lotIds.includes(savedProductId)) {
                await updateAuction(auctionId, { lotIds: [...auction.lotIds, savedProductId] });
            }

            toast({
                title: language === "en" ? "Assigned to Auction" : "Dodeljen Aukciji",
                description:
                    language === "en"
                        ? `Product has been assigned to "${auction?.title.en}" and status set to "On Auction".`
                        : `Proizvod je dodeljen aukciji "${auction?.title.sr}" i status je postavljen na "Na Aukciji".`,
            });
        } catch (error) {
            console.error("Error assigning to auction:", error);
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

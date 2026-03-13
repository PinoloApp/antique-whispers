import React from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCollectionAuctionAssignment } from "../hooks/useCollectionAuctionAssignment";

interface CollectionAuctionAssignmentDialogsProps {
    language: "en" | "sr";
    auctionHook: ReturnType<typeof useCollectionAuctionAssignment>;
}

export const CollectionAuctionAssignmentDialogs: React.FC<CollectionAuctionAssignmentDialogsProps> = ({
    language,
    auctionHook,
}) => {
    const {
        activeAssignmentDialog,
        categoryAuctions,
        pendingAssignAuctionId,
        setPendingAssignAuctionId,
        handleAssignToAuction,
        handleSkipAuctionAssign,
        isMutating,
    } = auctionHook;

    return (
        <Dialog 
            open={activeAssignmentDialog === "selectAuction"} 
            onOpenChange={(open) => {
                if (!open && !isMutating) handleSkipAuctionAssign();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{language === "en" ? "Assign to Active Auction" : "Dodeli Aktivnoj Aukciji"}</DialogTitle>
                    <DialogDescription>
                        {language === "en"
                            ? "There are active auctions for this collection's category. Would you like to assign it now? This action will auto-calculate lot numbers sequentially."
                            : "Postoje aktivne aukcije za kategoriju ove kolekcije. Da li želite da je dodelite sada? Ova akcija će automatski sekvencijalno izračunati brojeve lotova."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Select
                        value={pendingAssignAuctionId?.toString() || ""}
                        onValueChange={(val) => setPendingAssignAuctionId(Number(val))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder={language === "en" ? "Select an auction" : "Izaberi aukciju"} />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryAuctions.map((a) => (
                                <SelectItem key={a.id} value={a.id.toString()}>
                                    {a.title[language]} ({format(a.startDate, "dd.MM.yyyy")})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleSkipAuctionAssign} disabled={isMutating}>
                        {language === "en" ? "Skip" : "Preskoči"}
                    </Button>
                    <Button
                        onClick={() => pendingAssignAuctionId && handleAssignToAuction(pendingAssignAuctionId)}
                        disabled={!pendingAssignAuctionId || isMutating}
                        className="gap-2"
                    >
                        {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {language === "en" ? "Assign Collection" : "Dodeli Kolekciju"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
